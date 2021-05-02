# Fractalist

# Project Description

The project creates a fractal Spotify playlist cover based on attributes of the music in a playlist, specifically valence, mode, and energy. Users would also be able to customize the cover by modifying various elements such as font and color. The fractal image can then be downloaded to the user’s device or automatically uploaded to Spotify.

# APIs
* Spotify
* Fractal (https://github.com/rafgraph/fractal)

# Databases
* Postgres
* 

# Implementation




## Song Attributes
The attributes displayed in the fractal

**Mode:** modality (major or minor) of a song, (0 or 1)

**Valence:** positivitiness of a song, (value between 0.0 and 1.0)

**Energy:** intensity and activity of a song, (value between 0.0 and 1.0)


## Coloring Algorithm
The coloring of the fractal is implemented based on average values for features of the songs in a playlist:

### Mode:
**Major:** if the average modality of the playlist is 1, converts all black to white
  
**Minor:** if the average modality of the playlist is 0, converts all white to black
  
### Valence:  
**High valence:** if the average valence is >= 0.5, warmer colors will be used
**Low valence:** if the average valence is < 0.5, cooler colors will be used

### Energy:
**High energy:** if the average energy is >= 0.5, colors will be brighter
**Low energy:** if the average energy is < 0.5, colors will be darker
  
# Usage
1. User logs into their Spotify account
2. User selects playlist(s) in their library to create fractal(s)
3. User downloads fractal(s) and/or changes their Spotify playlist cover(s)


