from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
import json

BASE_URL = "http://127.0.0.1:8000/"

class AuthURL(APIView):
    def get(self, request, fornat=None):
        scopes = 'playlist-modify-public playlist-modify-private playlist-read-private'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        #return Response({'url': url}, status=status.HTTP_200_OK)
        return redirect(url)

def spotify_callback(request, format=None):
    code = str(request.GET.get('code'))
    #error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    print()
    print(response)
    print()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    #error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)
    
    return redirect('http://127.0.0.1:5500/frontend/playlist.html')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key) 
        headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
        }
        return Response({'status': is_authenticated},headers = headers, status=status.HTTP_200_OK)

class GetPlaylists(APIView):
    playlist_ids=[0]
    def get(self,request,format = None):
        key = self.request.session.session_key
        endpoint = 'me/playlists'
        response = execute_spotify_api_request(key,endpoint)
        #num_playlists = len(response['items']) # TODO: to be used for getting playlist id for all playlists
        self.playlist_ids[0] = response['items'][0]['id']
        headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
        }
        return Response(response, headers = headers, status=status.HTTP_200_OK)

class GetTracks(GetPlaylists):
    def get(self,request,format = None):
        avg_valence = 0
        avg_energy = 0
        mode_mode = 0
        key = self.request.session.session_key
        playlist_id = self.playlist_ids[0]
        endpoint = 'playlists/'+str(playlist_id)
        playlist_response = execute_spotify_api_request(key,endpoint)
        num_tracks = len(playlist_response['tracks']['items'])
        tracks=[0 for x in range(num_tracks)]
        mode = [0 for x in range(num_tracks)]
        for i in range(num_tracks):
            track_id = playlist_response['tracks']['items'][i]['track']['id']
            endpoint = 'audio-features/'+ track_id
            response = execute_spotify_api_request(key,endpoint)
            avg_valence+=response['valence']
            avg_energy+=response['energy']
            mode[i] = response['mode']
        mode_mode = max(set(mode), key=mode.count)
        avg_valence/=num_tracks
        avg_energy/=num_tracks
        return Response({'avg_valence':avg_valence, 'avg_energy':avg_energy, 'mode_mode':mode_mode}, status = status.HTTP_200_OK)