// https://github.com/rafgraph/fractal
// this code may be freely distributed under the GNU GPL v3 copyleft licence

(function(){
    'use strict';
  
    if (typeof window.mandelbrotFractal === "undefined") {
      window.mandelbrotFractal = {};
    }
    window.mandelbrotFractal.Fractal = Fractal;
  
    function Fractal(canvas){
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.cords = {};
      this.maxEscapeTime = 0;
      this.startCords = {};
      this.startMaxEscapeTime = 0;
      this.setToDefaults();
      this.alignCordsToCanvasRatio();
    }
  
  
    Fractal.prototype.update = function(options){
      var previousSettings = this.copyCurrentSettings();
  
      if (options.defaults) this.setToDefaults(); // true/false
      if (options.resetToDefaultCords) this.resetToDefaultCords(); // true/false
      if (options.resetCords) this.setCords(this.startCords); // true/false
      if (options.cords) this.setCords(options.cords);
      if (options.resetMaxEscapeTime) this.setMaxEscapeTime(this.startMaxEscapeTime); // true/false
      if (options.maxEscapeTime) this.setMaxEscapeTime(options.maxEscapeTime);
      if (options.zoomInPxPoint) this.zoomInPxPoint(options.zoomInPxPoint);
      if (options.zoomOutPxPoint) this.zoomOutPxPoint(options.zoomOutPxPoint);
      if (options.zoomInPxBox) this.zoomInPxBox(options.zoomInPxBox);
      if (options.setAsStartingOptions) this.setStartingOptions(); // true/false
      if (options.pxWidth && Math.floor(options.pxWidth) !== this.canvas.width)
        this.canvas.width = options.pxWidth;
      if (options.pxHeight && Math.floor(options.pxHeight) !== this.canvas.height)
        this.canvas.height = options.pxHeight;
      if (!options.distortion) this.alignCordsToCanvasRatio(); // by default this will run
      if (this.reDrawRequired(previousSettings)) this.draw();
    };
  
  
    Fractal.prototype.copyCurrentSettings = function(){
      return {
        cords: JSON.parse(JSON.stringify(this.cords)),
        maxEscapeTime: this.maxEscapeTime,
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height
      };
    };
  
  
    Fractal.prototype.reDrawRequired = function(previousSettings){
      if (
        previousSettings.maxEscapeTime === this.maxEscapeTime &&
        previousSettings.canvasWidth === this.canvas.width &&
        previousSettings.canvasHeight === this.canvas.height &&
        previousSettings.cords.xCartMin === this.cords.xCartMin &&
        previousSettings.cords.xCartMax === this.cords.xCartMax &&
        previousSettings.cords.yCartMin === this.cords.yCartMin &&
        previousSettings.cords.yCartMax === this.cords.yCartMax
      ) {
        return false;
      } else {
        return true;
      }
    };
  
  
    Fractal.prototype.setToDefaults = function(){
      this.resetToDefaultCords();
      this.maxEscapeTime = 224;
      this.setStartingOptions();
    };
  
  
    Fractal.prototype.resetToDefaultCords = function(){
      this.setCords({
        xCartMin: -2.1,
        xCartMax: 0.8,
        yCartMin: -1.2,
        yCartMax: 1.2
      });
      this.startCords = JSON.parse(JSON.stringify(this.cords));
    };
  
  
    Fractal.prototype.setCords = function(cords){
      var properties = ['xCartMin', 'xCartMax', 'yCartMin', 'yCartMax'];
  
      properties.forEach(function(property){
        if (!Number.isFinite(cords[property])) {
          throw "Error with " + property + " cord, its value is: " + cords[property];
        }
      });
  
      properties.forEach(function(property){
        this.cords[property] = cords[property];
      }.bind(this));
    };
  
  
    Fractal.prototype.setMaxEscapeTime = function(maxEscapeTime){
      if (maxEscapeTime > 1792) {
        this.maxEscapeTime = 1792;
      } else if (maxEscapeTime < 14) {
        this.maxEscapeTime = 14;
      } else {
        this.maxEscapeTime = Math.floor(maxEscapeTime / 7) * 7;
      }
    };
  
  
    Fractal.prototype.zoomInPxPoint = function(pxPoint) {
      var zoomMultiple = 0.2;
      this.determineZoomPxCords(zoomMultiple, pxPoint);
    };
  
  
    Fractal.prototype.zoomOutPxPoint = function(pxPoint) {
      var zoomMultiple = 5;
      this.determineZoomPxCords(zoomMultiple, pxPoint);
    };
  
  
    Fractal.prototype.zoomInPxBox = function(pxCords) {
      this.convertPxCordsToCartCords(pxCords);
    };
  
  
    Fractal.prototype.determineZoomPxCords = function(zoomMultiple, pxPoint){
      var diffPxWidth = Math.floor(this.canvas.width * (zoomMultiple / 2));
      var diffPxHeight = Math.floor(this.canvas.height * (zoomMultiple / 2));
  
      var pxCords = {
        xPxMin: pxPoint.xPx - diffPxWidth,
        xPxMax: pxPoint.xPx + diffPxWidth,
        yPxMin: pxPoint.yPx - diffPxHeight,
        yPxMax: pxPoint.yPx + diffPxHeight
      };
  
      this.convertPxCordsToCartCords(pxCords);
    };
  
  
    Fractal.prototype.convertPxCordsToCartCords = function(pxCords){
      var newCartCords = {
        xCartMin: this.pixelToCartX(pxCords.xPxMin),
        xCartMax: this.pixelToCartX(pxCords.xPxMax),
        yCartMin: this.pixelToCartY(pxCords.yPxMin),
        yCartMax: this.pixelToCartY(pxCords.yPxMax)
      };
  
      this.setCords(newCartCords);
    };
  
  
    Fractal.prototype.setStartingOptions = function(){
      this.startCords = JSON.parse(JSON.stringify(this.cords));
      this.startMaxEscapeTime = this.maxEscapeTime;
    };
  
  
    Fractal.prototype.alignCordsToCanvasRatio = function() {
      var ctWidth = this.cords.xCartMax - this.cords.xCartMin;
      var ctHeight = this.cords.yCartMax - this.cords.yCartMin;
      var pxWidth = this.canvas.width;
      var pxHeight = this.canvas.height;
      if (ctHeight / ctWidth === pxHeight / pxWidth) return;
  
      if (ctHeight / ctWidth < pxHeight / pxWidth) {
        var oldCtHeight = ctHeight;
        ctHeight = ctWidth * (pxHeight / pxWidth);
        var diff = ctHeight - oldCtHeight;
        this.cords.yCartMax += diff / 2;
        this.cords.yCartMin -= diff / 2;
      } else {
        var oldCtWidth = ctWidth;
        ctWidth = ctHeight * (pxWidth / pxHeight);
        diff = ctWidth - oldCtWidth;
        this.cords.xCartMax += (diff / 2);
        this.cords.xCartMin -= (diff / 2);
      }
    };
  
  
    Fractal.prototype.pixelToCartX = function(x){
      var pxRatio = x / this.canvas.width;
      var cartWidth = this.cords.xCartMax - this.cords.xCartMin;
      return this.cords.xCartMin + (cartWidth * pxRatio);
    };
  
  
    Fractal.prototype.pixelToCartY = function(y){
      var pxRatio = y / this.canvas.height;
      var cartHeight = this.cords.yCartMax - this.cords.yCartMin;
      return this.cords.yCartMin + (cartHeight * pxRatio);
    };
  
  
    Fractal.prototype.draw = function(){
      var imageData = this.drawToImageData();
      this.ctx.putImageData(imageData, 0, 0);
  
      // use the following to print size on canvas for debugging
      // var fontSize = 1.25 * devicePixelRatio;
      // this.ctx.font="300 " + fontSize + "em Helvetica";
      // this.ctx.fillStyle = "#c0c0c0";
      // this.ctx.fillText("w: " + imageData.width + " h: " + imageData.height, 75 * devicePixelRatio, 165 * devicePixelRatio);
    };
  
  
    Fractal.prototype.drawToImageData = function(){
      var imageData = new ImageData(this.canvas.width, this.canvas.height);
      var yCart, xCart, escapeTime, rgbNum, index;
  
      for (var y = 0; y < imageData.height; y++){
        yCart = this.pixelToCartY(y);
  
        for (var x = 0; x < imageData.width; x++){
          xCart = this.pixelToCartX(x);
          escapeTime = this.calcEscapeTime(xCart, yCart);
  
          rgbNum = this.rgbNum(escapeTime);
  
          // debugging console log
          // console.log(x + ", " + y + " - " + Math.round(xCart * 100) / 100 + ", " + Math.round(yCart * 100) / 100 + " - " + escapeTime + " - " + rgbNum[0] + ", " + rgbNum[1] + ", " + rgbNum[2]);
  
          index = (y * imageData.width + x) * 4;
          imageData.data[index] = rgbNum[0];
          imageData.data[index + 1] = rgbNum[1];
          imageData.data[index + 2] = rgbNum[2];
          imageData.data[index + 3] = 255;
        }
      }
  
      console.log("max escape time: " + this.maxEscapeTime);
      console.log("cords: ", this.cords);
      console.log("pixels: width: " + imageData.width + ", height: " +imageData.height);
      console.log("done drawToImageData");
      return imageData;
    };
  
  
    Fractal.prototype.calcEscapeTime = function(xCart, yCart){
  
      var escapeTime = 0;
      var oldX = xCart;
      var oldY = yCart;
      var newX, newY;
  
      while (this.distFromOrigin(oldX, oldY) < 2 && escapeTime < this.maxEscapeTime) {
        newX = (oldX * oldX) - (oldY * oldY) + xCart;
        newY = (2 * oldX * oldY) + yCart;
  
        oldX = newX;
        oldY = newY;
  
        escapeTime += 1;
      }
  
      return escapeTime;
    };
  
  
    Fractal.prototype.distFromOrigin = function(x, y){
      return Math.sqrt(x * x + y * y);
    };
  
  
    ///////////////////////////////////////////////////////////////////////////////
    //coloring algorithm:
    //start with 2 of the 3 red, green and blue values fixed at either 0 or 255,
    //then increase the other R, G or B value in a given number of increments
    //repeat this for seven cases and you get a maximum of 1792 colors (7*256)
    //note that white repeats 3 times, at the end of cases 2, 4 and 6
    //the seven case are:
    //case 0: R=0, B=0, increase green from 0 to 255
    //case 1: R=0 G=255, increase blue from 0 to 255
    //case 2: G=255, B=255, increase red form 0 to 255
    //case 3: G=0, B=255, increase red from 0 to 255
    //case 4: R=255, B=255, increase green from 0 to 255
    //case 5: R=255, B=0, increase green from 0 to 255
    //case 6: R=255, G=255, increase blue from 0 to 255
    ///////////////////////////////////////////////////////////////////////////////
  
    Fractal.prototype.rgbNum = function(escapeTime){
      if (escapeTime <= 2) {
        return [0, 0, 0];
      } else if (escapeTime === this.maxEscapeTime) {
        return [0, 25, 0];
      }
  
      var redNum;
      var greenNum;
      var blueNum;
      var rgbIncrements = Math.floor(((this.maxEscapeTime) / 7));
      var caseNum = Math.floor(escapeTime / rgbIncrements);
      var remainNum = escapeTime % rgbIncrements;
  
      switch (caseNum) {
        case 0:
          redNum = 0;
          greenNum = Math.floor(256 / rgbIncrements) * remainNum;
          blueNum = 0;
          break;
        case 1:
          redNum = 0;
          greenNum = 255;
          blueNum = Math.floor(256 / rgbIncrements) * remainNum;
          break;
        case 2:
          redNum = Math.floor(256 / rgbIncrements) * remainNum;
          greenNum = 255;
          blueNum = 255;
          break;
        case 3:
          redNum = Math.floor(256 / rgbIncrements) * remainNum;
          greenNum = 0;
          blueNum = 255;
          break;
        case 4:
          redNum = 255;
          greenNum = Math.floor(256 / rgbIncrements) * remainNum;
          blueNum = 255;
          break;
        case 5:
          redNum = 255;
          greenNum = Math.floor(256 / rgbIncrements) * remainNum;
          blueNum = 0;
          break;
        case 6:
          redNum = 255;
          greenNum = 255;
          blueNum = Math.floor(256 / rgbIncrements) * remainNum;
          break;
      }
  
      return [redNum, greenNum, blueNum];
    };
  
  })();