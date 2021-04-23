// https://github.com/rafgraph/fractal
// this code may be freely distributed under the GNU GPL v3 copyleft licence

(function(){
    'use strict';
  
    if (typeof window.mandelbrotFractal === "undefined") {
      window.mandelbrotFractal = {};
    }
    window.mandelbrotFractal.App = App;
  
  
    function App(){
      this.elements = {};
      this.getElements();
      this.fractal = new window.mandelbrotFractal.Fractal(this.elements.fractalCanvas);
      this.isTouchDevice = this.determineTouch();
      this.fullscreenSupported = this.determineFullscreenSupport();
      this.tapPoints = 0;
      this.lastTouchStart = null;
      if (this.isTouchDevice) this.setTouchStyle();
      this.addEventListeners();
      this.fractalOptions = {};
      this.initialSetup();
    }
  
  
    App.prototype.initialSetup = function(){
      this.fractalOptions.defaults = true;
      setTimeout(function(){
        this.updateFractal();
      }.bind(this), 200);
    };
  
  
    App.prototype.setTouchStyle = function(){
      document.getElementsByTagName("body")[0].classList.add("touch");
      document.getElementById("zoom-in-info").innerHTML = "tap to zoom in";
      document.getElementById("zoom-out-info").innerHTML = "tap 2 fingers to zoom out";
      document.getElementById("reset-info").innerHTML = "tap 3 fingers to reset";
      document.getElementById("exit-info").innerHTML = "tap 4 fingers to exit";
    };
  
  
    App.prototype.getElements = function(){
      var els = this.elements;
      els.launchPage = document.getElementById("launch-page");
      els.launchFractal = document.getElementById("launch-fractal");
      els.launch448Fractal = document.getElementById("448-escape-time");
      els.launch896Fractal = document.getElementById("896-escape-time");
      els.launch1792Fractal = document.getElementById("1792-escape-time");
      els.fractalGraphics = document.getElementById("fractal-graphics");
      els.fractalCanvas = document.getElementById("fractal-canvas");
      els.loadingFractal = document.getElementById("loading-fractal");
      els.creditLine = document.getElementById("credit-line");
    };
  
  
    App.prototype.addEventListeners = function(){
      var els = this.elements;
      var evFuncs = this.eventFunctions;
      els.launchFractal.addEventListener("click", evFuncs.launchFractal.bind(this, 224));
      els.launch448Fractal.addEventListener("click", evFuncs.launchFractal.bind(this, 448));
      els.launch896Fractal.addEventListener("click", evFuncs.launchFractal.bind(this, 896));
      els.launch1792Fractal.addEventListener("click", evFuncs.launchFractal.bind(this, 1792));
  
      els.fractalCanvas.addEventListener("click", evFuncs.clickFractalCanvas.bind(this));
  
      if (this.isTouchDevice) {
        els.launchFractal.addEventListener("touchstart", evFuncs.launchFractal.bind(this, 224));
        els.launch448Fractal.addEventListener("touchstart", evFuncs.launchFractal.bind(this, 448));
        els.launch896Fractal.addEventListener("touchstart", evFuncs.launchFractal.bind(this, 896));
        els.launch1792Fractal.addEventListener("touchstart", evFuncs.launchFractal.bind(this, 1792));
  
        els.creditLine.addEventListener("touchstart", evFuncs.touchStartCreditLine.bind(this));
  
        els.fractalCanvas.addEventListener("touchstart", evFuncs.touchStartFractalCanvas.bind(this));
        els.fractalCanvas.addEventListener("touchmove", evFuncs.touchMoveFractalCanvas.bind(this));
        els.fractalCanvas.addEventListener("touchend", evFuncs.touchEndFractalCanvas.bind(this));
  
        window.addEventListener("orientationchange", evFuncs.handleDeviceOrientationChange.bind(this));
        window.addEventListener("mozorientationchange", evFuncs.handleDeviceOrientationChange.bind(this));
        window.addEventListener("msorientationchange", evFuncs.handleDeviceOrientationChange.bind(this));
      }
  
      if (document.fullscreenEnabled) {
        document.addEventListener("fullscreenchange", evFuncs.fullscreenChange.bind(this));
      } else if (document.webkitFullscreenEnabled) {
        document.addEventListener("webkitfullscreenchange", evFuncs.fullscreenChange.bind(this));
      } else if (document.mozFullScreenEnabled) {
        document.addEventListener("mozfullscreenchange", evFuncs.fullscreenChange.bind(this));
      } else if (document.msFullscreenEnabled) {
        document.addEventListener("MSFullscreenChange", evFuncs.fullscreenChange.bind(this));
      }
  
    };
  
  
    App.prototype.eventFunctions = {
  
      touchStartFractalCanvas: function(event){
        // required for 2 finger tap to work on android, prevents pinch to zoom
        event.preventDefault();
        this.tapPoints += event.changedTouches.length;
        this.lastTouchStart = new Date();
      },
  
      touchMoveFractalCanvas: function(event){
        event.preventDefault();
      },
  
      touchEndFractalCanvas: function(event){
        event.preventDefault();
  
        // handle state changes first
        var previousTapPoints = this.tapPoints;
        this.tapPoints = 0;
  
        if (new Date() - this.lastTouchStart > 250) return;
  
        switch (previousTapPoints) {
          case 1:
            this.fractalOptions.zoomInPxPoint = {
              xPx: event.changedTouches[0].pageX * devicePixelRatio,
              yPx: event.changedTouches[0].pageY * devicePixelRatio
            };
            this.updateFractal();
            break;
          case 2:
            this.fractalOptions.zoomOutPxPoint = {
              xPx: this.elements.fractalCanvas.width / 2,
              yPx: this.elements.fractalCanvas.height / 2
            };
            this.updateFractal();
            break;
          case 3:
            this.fractalOptions.resetCords = true;
            this.updateFractal();
            break;
          case 4:
            this.exitFullscreenMode();
            this.hideFractal();
            break;
        }
      },
  
      handleDeviceOrientationChange: function(){
        if (this.fractalShown()) this.updateFractal();
      },
  
      launchFractal: function(maxEscapeTime, event){
        event.preventDefault();
        this.showFractal(maxEscapeTime);
      },
  
      clickFractalCanvas: function(event){
        if (event.shiftKey) {
          this.fractalOptions.resetCords = true;
        } else {
          var eventX = event.offsetX * devicePixelRatio;
          var eventY = event.offsetY * devicePixelRatio;
          if (event.altKey) {
            this.fractalOptions.zoomOutPxPoint = {
              xPx: eventX,
              yPx: eventY
            };
          } else {
            this.fractalOptions.zoomInPxPoint = {
              xPx: eventX,
              yPx: eventY
            };
          }
        }
        this.updateFractal();
      },
  
      fullscreenChange: function(){
        if (!this.inFullscreenMode()) {
          this.hideFractal();
        }
      },
  
      touchStartCreditLine: function(event){
        event.preventDefault();
        var url = this.elements.creditLine.getAttribute("href");
        window.location.href = url;
      }
    };
  
    App.prototype.updateFractalSize = function(){
      var width, height;
  
      if (this.fullscreenSupported) {
        width = screen.width;
        height = screen.height;
      } else {
  
        //important - use clientWidth/Height instead of innerWidth/Height
        //when zoomed in on mobile device, clientWidth/Height will be the
        //full size of the browser window (same as when not zoomed in),
        //while the innerWidth/Height will be the much smaller cropped size
        //that's zoomed in on
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
  
        //note could also use offsetWidth/Height, as this is size of the html body,
        //but make sure the body element is sized correctly given fixed/absolute
        //positioned elements, e.g. body min-height/width 100vw/vh
        //chose to use clientWidth/Height becasue really what's needed is the size
        //of the viewport to render fractal the size of the viewport, not the size
        //of the html body
        // width = document.documentElement.offsetWidth;
        // height = document.documentElement.offsetHeight;
      }
  
      this.elements.fractalCanvas.setAttribute(
        "style", "width: " + width + "px; height: " + height + "px;"
      );
  
      this.fractalOptions.pxWidth = width * devicePixelRatio;
      this.fractalOptions.pxHeight = height * devicePixelRatio;
    };
  
  
    App.prototype.hideFractal = function(){
      this.elements.fractalGraphics.style.display = "none";
      this.elements.launchPage.style.display = "block";
    };
  
  
    App.prototype.fractalShown = function(){
      var fractalEl = this.elements.fractalGraphics;
      var display = window.getComputedStyle(fractalEl, null).getPropertyValue("display");
      if (display !== "none") return true;
    };
  
  
    App.prototype.showFractal = function(maxEscapeTime){
      this.elements.fractalGraphics.style.display = "block";
      this.elements.loadingFractal.style.display = "block";
      this.elements.launchPage.style.display = "none";
      if (this.fullscreenSupported) {
        this.enterFullscreenMode(this.elements.fractalGraphics);
      }
  
      this.fractalOptions.maxEscapeTime = maxEscapeTime;
  
  
      //long 2.5s wait to ensure instructions shown for at least 2.5s
      //if don't need to show instructions, would still need ~300ms wait
      //to allow the transition of show/hide/enterfullscreen to happen before
      //the fractal starts drawing (which can freeze the browser in the middle
      //of transistions) - is there a command to not draw until transitions
      //are finished (including brower's enter fullscreen mode transition)?
      setTimeout(function(){
        this.updateFractal();
      }.bind(this), 2500);
    };
  
  
    App.prototype.updateFractal = function(){
      var fractalShown = this.fractalShown();
      if (fractalShown) this.elements.loadingFractal.style.display = "block";
  
  
      //hack workaround so the loading fractal div is rendered before the fractal
      //starts drawing
      setTimeout(function(){
        this.updateFractalSize();
        this.fractal.update(this.fractalOptions);
        this.fractalOptions = {};
  
        setTimeout(function(){
          //hack workaround b/c additional click events while drawing fractal
          //aren't registered by the browser until after it's done drawing,
          //so this timeout is needed so the additional clicks, which should do
          //nothing, are registered on the #loading-fractal div before it is hidden
          //and not on the canvas, which would cause another zoom
          if (fractalShown) this.elements.loadingFractal.style.display = "none";
        }.bind(this), 200);
      }.bind(this), 200);
    };
  
  
  
    App.prototype.determineTouch = function(){
      if ('ontouchstart' in window) {
        return true;
      }
      return false;
    };
  
  
    //fullscreen functions:
  
    App.prototype.determineFullscreenSupport = function(){
      if (
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
      ) {
        return true;
      }
      return false;
    };
  
  
    App.prototype.inFullscreenMode = function(){
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        return true;
      }
      return false;
    };
  
  
    App.prototype.exitFullscreenMode = function(){
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };
  
  
    App.prototype.enterFullscreenMode = function(element){
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    };
  
  })();