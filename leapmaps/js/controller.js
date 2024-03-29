Controller = {

	cursorSize : 5, //px
	helpWindow : false,
	showHelpWindowOnStart : true,
	canShowNextWindow : true,
	helpViews : [],
	currentHelpView : null,
	numberOfClockwise : 0,
	numberOfCounterClockwise : 0,

	initialize : function() {
  	Controller.helpViews = ['h1.html', 'h2.html', 'h3.html', 'h4.html'];

		// Register keypress event handler
    $(document).keyup(function(e) {
      Controller.handleKeypress(e);
    });

		// When document is ready and loaded set the map canvas' size
		// Add the map
		$(document).ready(function() {
		    var bodyheight = $(window).height();
		    $("#map-canvas").height(bodyheight);
		    
		    MapsController.initialize();

		    if (Controller.showHelpWindowOnStart) {
		    	Controller.addOrRemoveHelpWindow();
		  	}
	    	
		});

		// Add resize listener event
		$(window).resize(function() {
		    var bodyheight = $(window).height();
		    $("#map-canvas").height(bodyheight);

		    Controller.computeCanvasSize();
		});
	},

	/**
	* Attaches or detaches the canvas where the cursor should be painted
	* 
	* shouldAttach : true if the canvas should be attached
	**/
	attachDetachCanvas : function (shoudAttach) {
		if (shoudAttach) {
			if(document.getElementById("cursor-canvas") == null) {
				// create canvas document
				var cursorCnv = document.createElement("canvas");
				cursorCnv.height = $("#map-canvas").height();
				cursorCnv.width = $("#map-canvas").width();
				cursorCnv.setAttribute("id", "cursor-canvas");

				var wrp = document.getElementById("wrapper");
				wrp.setAttribute("class", "no-mouse");
				var mapCnv = document.getElementById("map-canvas");
				wrp.insertBefore(cursorCnv, mapCnv);
			}
		} else {
			if(document.getElementById("cursor-canvas")) {
				document.getElementById("cursor-canvas").remove();
				var wrp = document.getElementById("wrapper");
				wrp.removeAttribute("class");
			}
		}
	},

	/**
	* Computes the size of the canvas based on the screen size
	**/
	computeCanvasSize : function() {
		if(document.getElementById("cursor-canvas")) {
	    var bodyheight = $("#map-canvas").height();
			var bodywidth = $("#map-canvas").width();
				
			var canvas = document.getElementsByTagName('canvas')[0];
			canvas.width  = bodywidth;
			canvas.height = bodyheight;
		}
	},

	/**
	* Draws a cursor on the screen based on the given position
	* 
	* x : x coordinate
	* y : y coordinate
	**/
	drawCursor : function(x, y) {
		if (!Controller.helpWindow) {
			if (x > $("#map-canvas").width() - Controller.cursorSize)
				x = $("#map-canvas").width() - Controller.cursorSize;
			if (y > $("#map-canvas").height() - Controller.cursorSize)
				y = $("#map-canvas").height() - Controller.cursorSize;

			var canvas = document.getElementById('cursor-canvas');
			if (canvas) {
				var context = canvas.getContext('2d');

				context.clearRect(0, 0, context.canvas.width, context.canvas.height);

				context.beginPath();
				context.rect(x, y, Controller.cursorSize, Controller.cursorSize);
				context.fill();
			}
		}
	},

	/**
	* Adds the help window or removes it if previously added
	**/
	addOrRemoveHelpWindow : function() {
		if (!Controller.helpWindow) {
			Controller.helpWindow = true;
			var helpwnd = document.createElement("div");
			helpwnd.setAttribute("id", "help");
			document.getElementById("wrapper").appendChild(helpwnd);

			Controller.loadHelpView(0);
			Controller.attachDetachCanvas(false);
				
			// create a canvas in order for the window to act like a modal one
			if(document.getElementById("modal-canvas") == null) {
				var modalCanvas = document.createElement("canvas");
				modalCanvas.height = $("#map-canvas").height();
				modalCanvas.width = $("#map-canvas").width();
				modalCanvas.setAttribute("id", "modal-canvas");

				var wrp = document.getElementById("wrapper");
				var mapCnv = document.getElementById("map-canvas");
				wrp.insertBefore(modalCanvas, mapCnv);
			}
		} else {
			Controller.helpWindow = false;
			if (document.getElementById("help"))
				document.getElementById("help").remove();
			if (document.getElementById("modal-canvas"))
				document.getElementById("modal-canvas").remove();
		}
	},

	/**
	* This function is just for demonstration purpose
	* It should add or remove a log window in the UI
	**/
	addOrRmoveLogWindow : function() {
		if(document.getElementById("log-window") == null) {
			var logWindow = document.createElement("div");
			logWindow.setAttribute("id", "log-window");
			document.getElementById("wrapper").appendChild(logWindow);
		} else {
			document.getElementById("log-window").remove();
		}
	},

 	/**
  * This function maps the hand position, given by the arguments
  * x and y, onto the [-15, 15] domain, which represents offset pixels
  * from the current position of the center of the map.
  * After the new position is computed, this function calls 
  * the google maps controller to pan the map to the new destination
  *
  * There is a safe space in the center of the screen,
  * which is defined by a ratio of 1/3 of the width and height
  * of the browser. 
  * If the hand (cursor) is positioned in the safe space, the
  * map will not pan.
  *
  * Based on the offset of the hand position (cursor) from the 
  * center of the screen, the map is panned with less pixels
  * or more pixels, simulating acceleration in movement
  * 
  * x : x coordinate
  * y : y coordinate
  **/
  computePanningAcceleration : function(x, y) {
  	if(!Controller.helpWindow && !MapsController.isInStreetView()) {
	    var leftSize = window.innerWidth * 0.33;
	    var rightSize = window.innerWidth * 0.66;

	    var topSize = window.innerHeight * 0.33;
	    var bottomSize = window.innerHeight * 0.66;

	    var newX = 0;
	    var newY = 0;

	    if (x > rightSize)
	      newX = Controller.mapValueToInterval(x, rightSize, window.innerWidth, 0, 15);
	    else if (x < leftSize)
	      newX = Controller.mapValueToInterval(x, 0, leftSize, -15, 0);

	    if (y > bottomSize)
	      newY = Controller.mapValueToInterval(y, bottomSize, window.innerHeight, 0, 15);
	    else if (y < topSize)
	      newY = Controller.mapValueToInterval(y, 0, topSize, -15, 0);
	    
	    MapsController.panBy(newX, newY);
  	}
  },

  /**
  * This is a generic helper linear function that maps a value (x)  
  * from the given domain [a, b] to the given range [c, d].
  * f(a) = c and f(b) = d
  *
  * Three liniar maps are defined in order to achieve this.
  *
  *** f1: This map shifts the initial endpoint of the interval [a, b] to the origin
  *** f1(x) = x - a, therefore [a, b] --> [0, b-a]
  *
  *** f2: This scales the interval [0, b-a] so that the right endpoint becomes d-c
  *** f2(x) = x * (d - c)/(b - a)
  *** note: the length of the image interval is the same as the interval [c,d]
  *
  *** f3: This shifts [0, d-c] onto [c,d]
  *** f3(x) = x + c
  *
  * Puting it together: f(x) = f3(f2(f1(x)))
  *
  * x : the value for which the function should be computed
  * a : lowest value of the domain [a, b]
  * b : highest value of the domain [a, b]
  * c : lowest value of the range [c, d]
  * d : highest value of the range [c, d]
  *
  * return : f(x), where f: [a, b] --> [c, d]
  **/
  mapValueToInterval : function (x, a, b, c, d) {
    return Math.round(((d - c)/(b - a)) * (x - a) + c);
  },

  /**
	* Handles keypress events from the keyboard
	*
	* e : the event
	**/
	handleKeypress : function (e) {
		switch(e.keyCode) {
			case 27 : // ESC key
							if(Controller.helpWindow) {
								Controller.addOrRemoveHelpWindow();
							} else if (MapsController.isInStreetView()) {
								MapsController.switchMapMode(0,0);
							}
							break;
			case 37 : // LEFT arrow
							Controller.handleSwipe("fromLeftToRight");
							break;
			case 39 : // RIGHT arrow
							Controller.handleSwipe("fromRightToLeft");
							break;
			case 72: // H key
							Controller.addOrRemoveHelpWindow();
							break;
			case 76: // L key
							Controller.addOrRmoveLogWindow();
							break;
		}		
	},

  /**
  * Handles a circle gesture
  * 
  * Depending on the current state it can:
  * zoom in/out the Map 
  * move the current position in street view
  **/
  handleCircle : function (clockwise) {
		if(!Controller.helpWindow) {
			if (clockwise) {
		    Controller.numberOfClockwise++;

		    if (Controller.numberOfClockwise == 35) {
		      Controller.numberOfClockwise = 0;

		      if (MapsController.isInStreetView()) {
		        MapsController.moveStreetView(true);
		      } else { 
		        MapsController.zoomMap(true);
		      }
		    }
		  } else {
		    Controller.numberOfCounterClockwise++;

		    if (Controller.numberOfCounterClockwise == 35) {
		      Controller.numberOfCounterClockwise = 0;

		      if (MapsController.isInStreetView()) {
		        MapsController.moveStreetView(false);
		      } else { 
		        MapsController.zoomMap(false);
		      }
		    }
	  	}
		}
	},

  /**
  * Handles a swipe action detected by the Leap Motion
  * 
  * swipeDirection : the swipe direction
  **/
  handleSwipe : function(swipeDirection) {
		if (Controller.helpWindow) {
			if (Controller.canShowNextWindow)  {

				var nextView = null;
				for (var i = 0; i < Controller.helpViews.length; i++) {
					if (Controller.currentHelpView == Controller.helpViews[i]) {
						if (swipeDirection == "fromRightToLeft")
							nextView = i+1;
						else 
							nextView = i-1;
						break;
					}
				}

				if (nextView >= 0 && nextView < Controller.helpViews.length) {
					Controller.loadHelpView(nextView);
				} else if (nextView != -1) {
					Controller.addOrRemoveHelpWindow();
				}
			}

			// This fixes the multiple swipes detected at once 
			Controller.canShowNextWindow = false;
			Controller.sleep(250, Controller.releaseLock);
		} else {
			if (MapsController.isInStreetView()) {
	    	MapsController.rotate360(swipeDirection);
	  	} 
		}
  },

  /**
  * Handes a key tap gesture detected by the Leap Motion controller
  *
  * pixel : the screen pixel where the gesture occured
  **/
  handleKeyTap : function(pixel) {
  	if(!Controller.helpWindow && !MapsController.isInStreetView()) {
  		MapsController.addRemoveMarker(pixel.x, pixel.y);
  	}
  },

  /**
  * Handes a screen tap gesture detected by the Leap Motion controller
  *
  * pixel : the screen pixel where the gesture occured
  **/
  handleScreenTap : function(pixel) {
    if (!Controller.helpWindow) {
    	MapsController.switchMapMode(pixel.x, pixel.y);
  	}
  },

  /**
  * Helper function used to load a help html view into the help popup window
  *
  * viewNumber : the index number of the view that has to be loaded
  **/
  loadHelpView : function(viewNumber) {
 		$(function() {
      $("#help").load("views/help/" + Controller.helpViews[viewNumber]);
      Controller.currentHelpView = Controller.helpViews[viewNumber];
    });
  },

  /**
  * Call this function to release the lock related to 
  * the help window. 
  **/
  releaseLock : function() {
  	Controller.canShowNextWindow = true;
  },

	/**
	* Sleep function with a callback
	* 
	* millis : time in milliseconds to sleep
	* callback : callback function
	**/
	sleep : function(millis, callback) {
    setTimeout(function() { 
    	callback();
    }, millis);
	}
}