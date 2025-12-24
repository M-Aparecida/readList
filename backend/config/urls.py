from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from resenhas.views import RegisterView, UserDetailView, PublicProfileView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='user_detail'),
    path('api/auth/profile/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
    path('api/', include('resenhas.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
