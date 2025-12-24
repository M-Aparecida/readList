from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Resenha, Comentario, Mensagem, Notificacao, Perfil

class ReadListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username="dono", email="dono@test.com", password="password123")
        self.visitor = User.objects.create_user(username="visitante", email="visitante@test.com", password="password123")
        
        if not hasattr(self.owner, 'perfil'): Perfil.objects.create(usuario=self.owner)
        if not hasattr(self.visitor, 'perfil'): Perfil.objects.create(usuario=self.visitor)
        
        self.resenha = Resenha.objects.create(
            usuario=self.owner, titulo_livro="Livro Teste", autor_livro="Autor Teste", 
            nota=5, texto_resenha="Resenha Base"
        )

    def test_login_username(self):
        resp = self.client.post("/api/auth/login/", {"username": "dono", "password": "password123"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_login_email(self):
        resp = self.client.post("/api/auth/login/", {"username": "dono@test.com", "password": "password123"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_login_fail(self):
        resp = self.client.post("/api/auth/login/", {"username": "dono", "password": "errada"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_auth_backend_none(self):
        from config.authentication import EmailOrUsernameModelBackend
        backend = EmailOrUsernameModelBackend()
        self.assertIsNone(backend.authenticate(None, username=None, password="xyz"))
        self.assertIsNone(backend.authenticate(None, username="fantasma", password="xyz"))

    def test_permission_read(self):
        self.client.force_authenticate(user=self.visitor)
        resp = self.client.get(f"/api/resenhas/{self.resenha.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_permission_write_allowed(self):
        self.client.force_authenticate(user=self.owner)
        resp = self.client.patch(f"/api/resenhas/{self.resenha.id}/", {"nota": 4}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_permission_write_denied(self):
        self.client.force_authenticate(user=self.visitor)
        resp = self.client.patch(f"/api/resenhas/{self.resenha.id}/", {"nota": 1}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_comentario_permission_cycle(self):
        c = Comentario.objects.create(usuario=self.owner, resenha=self.resenha, texto="Original")
        self.client.force_authenticate(user=self.visitor)
        self.client.get(f"/api/comentarios/{c.id}/")
        resp = self.client.patch(f"/api/comentarios/{c.id}/", {"texto": "Hack"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(user=self.owner)
        resp = self.client.patch(f"/api/comentarios/{c.id}/", {"texto": "Novo"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        resp = self.client.delete(f"/api/comentarios/{c.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_public_profile_view(self):
        self.client.force_authenticate(user=self.visitor)
        resp = self.client.get(f"/api/auth/profile/{self.owner.username}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        resp = self.client.get("/api/auth/profile/naoexiste/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_self_notification_logic(self):
        self.client.force_authenticate(user=self.owner)
        before = Notificacao.objects.count()
        self.client.post(f"/api/resenhas/{self.resenha.id}/comentar/", {"texto": "Self"}, format='json')
        after = Notificacao.objects.count()
        self.assertEqual(before, after)

    def test_user_detail_branch(self):
        self.client.force_authenticate(user=self.owner)
        self.client.get("/api/auth/me/")
        self.client.patch("/api/auth/me/", {"bio": "T"}, format='json')

    def test_message_invalid(self):
        self.client.force_authenticate(user=self.owner)
        resp = self.client.post("/api/mensagens/", {"destinatario_username": "x", "texto": "y"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_comment_invalid_parent(self):
        self.client.force_authenticate(user=self.owner)
        resp = self.client.post(f"/api/resenhas/{self.resenha.id}/comentar/", {"texto": "T", "parent_id": 99}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_resenha_queryset(self):
        self.client.force_authenticate(user=self.owner)
        self.client.get("/api/resenhas/")
        self.client.get("/api/resenhas/?only_mine=true")
        self.client.get("/api/resenhas/?search=Livro")

    def test_curtir_toggle(self):
        self.client.force_authenticate(user=self.visitor)
        self.client.post(f"/api/resenhas/{self.resenha.id}/curtir/")
        self.client.post(f"/api/resenhas/{self.resenha.id}/curtir/")
        c = Comentario.objects.create(usuario=self.owner, resenha=self.resenha, texto="C")
        self.client.post(f"/api/comentarios/{c.id}/curtir/")
        self.client.post(f"/api/comentarios/{c.id}/curtir/")

    def test_create_validation(self):
        self.client.force_authenticate(user=self.owner)
        self.client.post("/api/resenhas/", {"titulo_livro": "T", "autor_livro": "A", "nota": 5, "texto_resenha": "T"}, format='json')
        resp = self.client.post("/api/resenhas/", {"nota": 5}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_comment_validation(self):
        self.client.force_authenticate(user=self.visitor)
        resp = self.client.post(f"/api/resenhas/{self.resenha.id}/comentar/", {"texto": ""}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_notifications_messages(self):
        self.client.force_authenticate(user=self.owner)
        self.client.post("/api/mensagens/", {"destinatario_username": "visitante", "texto": "Oi"}, format='json')
        self.client.get("/api/mensagens/conversa/?user=visitante")
        self.client.post("/api/notificacoes/marcar_lidas/")
        str(self.resenha); str(self.owner.perfil)
