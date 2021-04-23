from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('get_auth_url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is_authenticated', IsAuthenticated.as_view()),
    path('get_playlists',GetPlaylists.as_view()),
    path('get_tracks',GetTracks.as_view()),
    path('get_track_features',GetFeatures.as_view())
]
