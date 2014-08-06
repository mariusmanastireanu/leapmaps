var helpWindow = false;
var posx=100;
$(document).on("keypress", function(e) {

	switch(e.which) {

		case 104: // H button - help 
				if (!helpWindow) {
					addHelpWindow();
				} else {
					removeHelpWindow();
				}
				break;
		case 101: // E button - TODO: delete this case
				var sv = document.getElementById("map-canvas");
				TweenMax.to(sv, 1, {
					onUpdate: doStuff
					})
				break;

		case 119: // W button - TODO: delete this case
				$("#map-canvas").on("mousedown mouseup", function(e) {
					console.log("sth");
					rotate360("E");
				});

				var e = jQuery.Event("mousedown");
				$("#map-canvas").trigger(e);

				
				var e = jQuery.Event("mouseup");
				$("#map-canvas").trigger(e);

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

		case 105: // i key
				google.maps.event.trigger(map, 'drag', {lat: 30});
				break;
	}
});

function doStuff() {
	console.log('doing my stuff');
	rotate360("E");
}

// when document is ready and loaded set the map canvas' size
$(document).ready(function() {
    var bodyheight = $(window).height();
    $("#map-canvas").height(bodyheight);
});

// when resizing the window, update the map canvas' size
$(window).resize(function() {
    var bodyheight = $(window).height();
    $("#map-canvas").height(bodyheight);
});



function addHelpWindow() {
	console.log('adding window');
	helpWindow = true;
	var helpwnd = document.createElement("div");
	helpwnd.setAttribute("id", "help");
	document.getElementById("wrapper").appendChild(helpwnd);
}

function removeHelpWindow() {
	helpWindow = false;
	document.getElementById("help").remove();
}