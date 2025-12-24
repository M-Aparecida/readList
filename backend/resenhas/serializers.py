from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Resenha, Comentario, Perfil, Notificacao, Mensagem

def get_full_image_url(request, image_field):
    if image_field:
        try:
            return request.build_absolute_uri(image_field.url)
        except Exception:
            return image_field.url
    return None

class PerfilSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    class Meta: 
        model = Perfil
        fields = ['avatar', 'hobbies', 'bio']
    
    def get_avatar(self, obj):
        return get_full_image_url(self.context.get('request'), obj.avatar)

class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer(read_only=True)
    class Meta: 
        model = User
        fields = ("id", "username", "email", "perfil")

class PublicUserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer(read_only=True)
    class Meta: 
        model = User
        fields = ("id", "username", "perfil") 
class UpdateUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='perfil.avatar', required=False)
    hobbies = serializers.CharField(source='perfil.hobbies', required=False, allow_blank=True)
    bio = serializers.CharField(source='perfil.bio', required=False, allow_blank=True)

    class Meta: 
        model = User
        fields = ("username", "email", "avatar", "hobbies", "bio")
    
    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        perfil, _ = Perfil.objects.get_or_create(usuario=instance)
        if 'avatar' in perfil_data: perfil.avatar = perfil_data['avatar']
        if 'hobbies' in perfil_data: perfil.hobbies = perfil_data['hobbies']
        if 'bio' in perfil_data: perfil.bio = perfil_data['bio']
        perfil.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta: 
        model = User
        fields = ("id", "username", "password", "email")
    def create(self, val_data): return User.objects.create_user(**val_data)


class NotificacaoSerializer(serializers.ModelSerializer):
    remetente_nome = serializers.ReadOnlyField(source='remetente.username')
    remetente_avatar = serializers.SerializerMethodField()
    titulo_resenha = serializers.SerializerMethodField()

    class Meta: model = Notificacao; fields = '__all__'

    def get_remetente_avatar(self, obj):
        try:
            if hasattr(obj.remetente, 'perfil'): return get_full_image_url(self.context.get('request'), obj.remetente.perfil.avatar)
        except Exception: pass
        return None

    def get_titulo_resenha(self, obj): return obj.resenha.titulo_livro if obj.resenha else "Conteúdo removido"

class MensagemSerializer(serializers.ModelSerializer):
    remetente_nome = serializers.ReadOnlyField(source='remetente.username')
    remetente_avatar = serializers.SerializerMethodField()
    eh_minha = serializers.SerializerMethodField()
    
    class Meta: 
        model = Mensagem
        fields = '__all__'
        read_only_fields = ['remetente', 'destinatario', 'data']

    def get_eh_minha(self, obj):
        req = self.context.get("request")
        return req.user == obj.remetente if req else False

    def get_remetente_avatar(self, obj):
        try:
            if hasattr(obj.remetente, 'perfil'): return get_full_image_url(self.context.get('request'), obj.remetente.perfil.avatar)
        except Exception: pass
        return None

class ComentarioSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.ReadOnlyField(source="usuario.username")
    usuario_id = serializers.ReadOnlyField(source="usuario.id")
    usuario_avatar = serializers.SerializerMethodField()
    total_curtidas = serializers.SerializerMethodField()
    curtido_por_mim = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta: 
        model = Comentario
        fields = "__all__"
        read_only_fields = ["usuario", "resenha", "curtidas"]
        
    def get_total_curtidas(self, obj): return obj.curtidas.count()
    def get_curtido_por_mim(self, obj):
        req = self.context.get("request")
        return req.user.is_authenticated and obj.curtidas.filter(id=req.user.id).exists() if req else False
    def get_replies(self, obj):
        return ComentarioSerializer(obj.replies.all(), many=True, context=self.context).data if obj.replies.exists() else []
    def get_usuario_avatar(self, obj):
        try:
            if hasattr(obj.usuario, 'perfil'): return get_full_image_url(self.context.get('request'), obj.usuario.perfil.avatar)
        except Exception: pass
        return None

class ResenhaSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.ReadOnlyField(source="usuario.username")
    usuario_id = serializers.ReadOnlyField(source="usuario.id")
    usuario_avatar = serializers.SerializerMethodField()
    total_curtidas = serializers.SerializerMethodField()
    curtido_por_mim = serializers.SerializerMethodField()
    comentarios = serializers.SerializerMethodField()
    curtidores = serializers.SerializerMethodField() 

    class Meta: 
        model = Resenha
        fields = "__all__"
        read_only_fields = ["usuario", "curtidas"]
        
    def get_total_curtidas(self, obj): return obj.curtidas.count()
    def get_curtido_por_mim(self, obj):
        req = self.context.get("request")
        return req.user.is_authenticated and obj.curtidas.filter(id=req.user.id).exists() if req else False
    def get_comentarios(self, obj):
        qs = obj.comentarios.filter(parent=None).order_by('-data_criacao')
        return ComentarioSerializer(qs, many=True, context=self.context).data
    def get_usuario_avatar(self, obj):
        try:
            if hasattr(obj.usuario, 'perfil'): return get_full_image_url(self.context.get('request'), obj.usuario.perfil.avatar)
        except Exception: pass
        return None
    
    def get_curtidores(self, obj):
        curtidas = []
        request = self.context.get('request')
        for user in obj.curtidas.all():
            avatar_url = None
            try:
                if hasattr(user, 'perfil') and user.perfil.avatar:
                    avatar_url = get_full_image_url(request, user.perfil.avatar)
            except Exception: pass
            curtidas.append({'username': user.username, 'avatar': avatar_url})
        return curtidas
