/* ********* NEW COLOR ALGORITHM ***********
Major mode = convert all black [0,0,0] to white [255,255,255]
Minor mode = convert all white [255,255,255] to black [0,0,0]
High valence (>= 0.5) = warm colors (+red, -blue)
Low valence (< 0.5) = cool colors (-red, +blue)
High energy (>= 0.5) = bright colors (> 127)
Low energy (>= 0.5) = dark colors (<= 127)
************ */


switch (caseNum) {
    case 0:
        //Major mode, high valence (>= 0.5), high energy (>= 0.5)
      redNum = 255;
      greenNum = Math.floor(256 / rgbIncrements) * remainNum;
      blueNum = 0;
      break;
    case 1:
        //Major mode, high valence (>= 0.5), low energy (< 0.5)
        redNum = 127;
        greenNum = Math.floor(256 / rgbIncrements) * remainNum;
        blueNum = 0;
      break;
    case 2:
        //Major mode, low valence (< 0.5), high energy (>= 0.5)
        redNum = 0;
        greenNum = Math.floor(256 / rgbIncrements) * remainNum;
        blueNum = 255;
      break;
    case 3:
        //Major mode, low valence (< 0.5), low energy (< 0.5)
      redNum = Math.floor(256 / rgbIncrements) * remainNum;
      greenNum = 0;
      blueNum = 127;
      break;
    case 4:
        //minor mode, high valence (>= 0.5), high energy (>= 0.5)
      redNum = 255;
      greenNum = Math.floor(256 / rgbIncrements) * remainNum;
      blueNum = 0;
      break;
    case 5:
        //minor mode, high valence (>= 0.5), low energy (< 0.5)
      redNum = 127;
      greenNum = Math.floor(256 / rgbIncrements) * remainNum;
      blueNum = 0;
      break;
    case 6:
        //minor mode, low valence (< 0.5), high energy (>= 0.5)
      redNum = 0;
      greenNum = Math.floor(256 / rgbIncrements) * remainNum;
      blueNum = 255;
    case 7:
        //minor mode, low valence (< 0.5), low energy (< 0.5)
      redNum = 0;
      greenNum = Math.floor(256 / rgbIncrements) * remainNum;
      blueNum = 127;
    break;
  }