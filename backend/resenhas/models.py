from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

def validate_max_words_500(value):
    if len(value.strip().split()) > 500: raise ValidationError("Máximo 500 palavras.")
def validate_max_words_50(value):
    if len(value.strip().split()) > 50: raise ValidationError("Máximo 50 palavras.")

class Resenha(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resenhas")
    titulo_livro = models.CharField(max_length=1000, validators=[validate_max_words_50])
    autor_livro = models.CharField(max_length=1000, validators=[validate_max_words_50])
    url_imagem = models.URLField(blank=True, null=True)
    texto_resenha = models.TextField(validators=[validate_max_words_500])
    nota = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    data_criacao = models.DateTimeField(auto_now_add=True)
    curtidas = models.ManyToManyField(User, related_name="resenhas_curtidas", blank=True)
    def __str__(self): return f"{self.titulo_livro} - {self.usuario.username}"

class Comentario(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    resenha = models.ForeignKey(Resenha, on_delete=models.CASCADE, related_name="comentarios")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    texto = models.TextField(max_length=200)
    data_criacao = models.DateTimeField(auto_now_add=True)
    curtidas = models.ManyToManyField(User, related_name="comentarios_curtidos", blank=True)

class Perfil(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True) 
    hobbies = models.TextField(blank=True, default="")
    bio = models.TextField(blank=True, max_length=300, default="")

    def __str__(self): return f"Perfil de {self.usuario.username}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created: Perfil.objects.create(usuario=instance)

class Notificacao(models.Model):
    destinatario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes')
    remetente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes_enviadas')
    tipo = models.CharField(max_length=20, choices=[('curtida', 'Curtida'), ('comentario', 'Comentário'), ('mensagem', 'Mensagem')])
    resenha = models.ForeignKey(Resenha, on_delete=models.CASCADE, null=True, blank=True)
    lida = models.BooleanField(default=False)
    data = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ['-data']

class Mensagem(models.Model):
    remetente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='msgs_enviadas')
    destinatario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='msgs_recebidas')
    texto = models.TextField()
    data = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ['data']
