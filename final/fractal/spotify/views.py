from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
import json


class AuthURL(APIView):
    def get(self, request, fornat=None):
        scopes = 'playlist-modify-public playlist-modify-private playlist-read-private'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get('code')
    print(code)
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)
    
    return redirect('http://127.0.0.1:8000/')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

class GetPlaylists(APIView):
    playlist_ids=[0]
    def get(self,request,format = None):
        key = self.request.session.session_key
        endpoint = 'me/playlists'
        response = execute_spotify_api_request(key,endpoint)
        num_playlists = len(response['items']) # TODO: to be used for getting playlist id for all playlists
        self.playlist_ids[0] = response['items'][0]['id']
        return Response(response, status = status.HTTP_200_OK)

class GetTracks(GetPlaylists):
    tracks=[0]
    def get(self,request,format = None):
        key = self.request.session.session_key
        playlist_id = self.playlist_ids[0]
        endpoint = 'playlists/'+playlist_id
        response = execute_spotify_api_request(key,endpoint)
        self.tracks[0] = response['tracks']['items'][0]['track']['id']
        return Response(response, status = status.HTTP_200_OK)

class GetFeatures(GetTracks):
    def get(self,request,format = None):
        key = self.request.session.session_key
        playlist_id = self.playlist_ids[0]
        track_id = self.tracks[0]
        print(track_id)
        endpoint = 'audio-features/'+track_id
        response = execute_spotify_api_request(key,endpoint)

        return Response(response, status = status.HTTP_200_OK)