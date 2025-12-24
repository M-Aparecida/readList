from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResenhaViewSet, ComentarioViewSet, NotificacaoViewSet, MensagemViewSet

router = DefaultRouter()

router.register(r'resenhas', ResenhaViewSet, basename='resenha')
router.register(r'comentarios', ComentarioViewSet, basename='comentario')
router.register(r'notificacoes', NotificacaoViewSet, basename='notificacao')
router.register(r'mensagens', MensagemViewSet, basename='mensagem')

urlpatterns = [
    path('', include(router.urls)),
]
