Controller = {

	cursorSize : 5,

	helpWindow : false,

	initialize : function() {
		// Register keypress event handler
    $(document).on("keypress", function(e) {
      Controller.handleKeypress(e);
    });

		// When document is ready and loaded set the map canvas' size
		// Add the map
		$(document).ready(function() {
		    var bodyheight = $(window).height();
		    $("#map-canvas").height(bodyheight);
		    
		    MapsController.initialize();
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
				cursorCnv.height = $(window).height();
				cursorCnv.width = $(window).width();
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
	* Handles keypress events from the keyboard
	*
	* e : the event
	**/
	handleKeypress : function (e) {
		
		switch(e.which) {
			case 104: // H button
							Controller.addOrRemoveHelpWindow();
							break;
			case 93: // ] button -- TODO: delete this
							var evtDown = document.createEvent("MouseEvents");
							evtDown.initMouseEvent("mousedown", true,true, window, 
								0, posx,100,posx,100,false,false,false,false,0,null);
							$("#map-canvas")[0].dispatchEvent(evtDown);

							window.interv = setInterval(function() {
								var evt = document.createEvent("MouseEvents");
								evt.initMouseEvent("mousemove", true, true, "window", 
									0, posx,100,posx,100,false,false,false,false,0,null);
								posx+=10;
								evt.webkitMovementX=10;
								console.log(evt);
								$("#map-canvas")[0].dispatchEvent(evt);
								if (posx>1000) {
									var evtUp = document.createEvent("MouseEvents");
									evtUp.initMouseEvent("mouseup", true,true, window, 
										0, posx,100,posx,100,false,false,false,false,0,null);
									$("#map-canvas")[0].dispatchEvent(evtUp);

									posx=100;
									clearInterval(interv);
								}
							}, 16);
							break;
		}		
	},

	/**
	* Adds the help window or removes it if previously added
	**/
	addOrRemoveHelpWindow : function() {
		if (!helpWindow) {
			helpWindow = true;
			var helpwnd = document.createElement("div");
			helpwnd.setAttribute("id", "help");
			document.getElementById("wrapper").appendChild(helpwnd);
		} else {
			helpWindow = false;
			document.getElementById("help").remove();
		}
	},

	/**
	* Sleep function
	* 
	* millis : time in milliseconds to sleep
	* callback : callback function
	**/
	sleep : function(millis, callback) {
    setTimeout(function() { 
    	callback(); 
    }, millis);
	},

	/**
	* Computes the size of the canvas based on the screen size
	**/
	computeCanvasSize : function() {
		if(document.getElementById("cursor-canvas")) {
	    var bodyheight = $(window).height();
			var bodywidth = $(window).width();
				
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
		if (x > $(window).width() - Controller.cursorSize)
			x = $(window).width() - Controller.cursorSize;
		if (y > $(window).height() - Controller.cursorSize)
			y = $(window).height() - Controller.cursorSize;

		var canvas = document.getElementById('cursor-canvas');
		var context = canvas.getContext('2d');

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		context.beginPath();
		context.rect(x, y, Controller.cursorSize, Controller.cursorSize);
		context.fill();
	}

}