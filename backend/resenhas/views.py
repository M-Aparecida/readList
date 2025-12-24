from rest_framework import viewsets, generics, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Resenha, Comentario, Notificacao, Mensagem
from .serializers import (
    RegisterSerializer, UserSerializer, PublicUserSerializer, UpdateUserSerializer, 
    NotificacaoSerializer, MensagemSerializer, ComentarioSerializer, ResenhaSerializer
)
from .permissions import IsOwnerOrReadOnly
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q

def criar_notificacao(remetente, destinatario, tipo, resenha=None):
    if remetente != destinatario:
        Notificacao.objects.create(remetente=remetente, destinatario=destinatario, tipo=tipo, resenha=resenha)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all(); permission_classes = (AllowAny,); serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self): return UpdateUserSerializer if self.request.method in ['PUT', 'PATCH'] else UserSerializer
    def get_object(self): return self.request.user

class PublicProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]; serializer_class = PublicUserSerializer
    def get_object(self): return get_object_or_404(User, username=self.kwargs['username'])

class NotificacaoViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacaoSerializer; permission_classes = [IsAuthenticated]
    def get_queryset(self): return Notificacao.objects.filter(destinatario=self.request.user)
    @action(detail=False, methods=['post'])
    def marcar_lidas(self, request):
        self.get_queryset().update(lida=True); return Response({'status': 'ok'})

class MensagemViewSet(viewsets.ModelViewSet):
    serializer_class = MensagemSerializer; permission_classes = [IsAuthenticated]
    def get_queryset(self): return Mensagem.objects.filter(Q(remetente=self.request.user) | Q(destinatario=self.request.user))
    @action(detail=False, methods=['get'])
    def conversa(self, request):
        outro = request.query_params.get('user')
        msgs = self.get_queryset().filter(Q(remetente__username=outro) | Q(destinatario__username=outro))
        return Response(MensagemSerializer(msgs, many=True, context={'request': request}).data)
    def perform_create(self, serializer):
        dest = get_object_or_404(User, username=self.request.data.get('destinatario_username'))
        serializer.save(remetente=self.request.user, destinatario=dest)
        criar_notificacao(self.request.user, dest, 'mensagem')

class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all(); serializer_class = ComentarioSerializer
    def get_permissions(self):
        if self.action == 'curtir': return [IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']: return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()] 

    @action(detail=True, methods=['post'])
    def curtir(self, request, pk=None):
        c = self.get_object()
        if c.curtidas.filter(id=request.user.id).exists(): c.curtidas.remove(request.user)
        else: c.curtidas.add(request.user); criar_notificacao(request.user, c.usuario, 'curtida', c.resenha)
        return Response({'status': 'ok'})

class ResenhaViewSet(viewsets.ModelViewSet):
    serializer_class = ResenhaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo_livro', 'autor_livro', 'texto_resenha', 'usuario__username']
    ordering_fields = ['nota', 'data_criacao']

    def get_queryset(self):
        queryset = Resenha.objects.all().order_by('-data_criacao')
        if self.request.query_params.get('only_mine') == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(usuario=self.request.user)
        return queryset

    def get_permissions(self):
        if self.action in ['curtir', 'comentar']: return [IsAuthenticated()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def perform_create(self, serializer): serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def curtir(self, request, pk=None):
        resenha = self.get_object()
        if resenha.curtidas.filter(id=request.user.id).exists():
            resenha.curtidas.remove(request.user); return Response({'status': 'descurtido'})
        resenha.curtidas.add(request.user); criar_notificacao(request.user, resenha.usuario, 'curtida', resenha); return Response({'status': 'curtido'})

    @action(detail=True, methods=['post'])
    def comentar(self, request, pk=None):
        resenha = self.get_object(); parent_id = request.data.get('parent_id')
        parent_obj = get_object_or_404(Comentario, pk=parent_id) if parent_id else None
        serializer = ComentarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(usuario=request.user, resenha=resenha, parent=parent_obj)
            criar_notificacao(request.user, resenha.usuario, 'comentario', resenha)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
