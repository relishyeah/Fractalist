from django.urls import path
from .views import AuthURL,spotify_callback, IsAuthenticated

urlpatterns = [
    path('get_auth_url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view())
]
