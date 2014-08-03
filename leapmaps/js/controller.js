var helpWindow = true;

$(document).on("keypress", function(e) {
	
	switch(e.which) {

		case 104: // H button - help 
				if (!helpWindow) {
					addHelpWindow();
				} else {
					removeHelpWindow();
				}
				break;
	}
});

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