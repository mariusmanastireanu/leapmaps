var map;
var lat = 46.7667;
var lng = 23.5833;
var zoom = 8;

var latLngStep = 0.1;
var zoomStep = 1;

function initialize() {
	// map options
	var mapOptions = {
	  center: new google.maps.LatLng(lat, lng),
	  zoom: zoom,
	  panControl: false,
	  zoomControl: false
	};

	// map element
	map = new google.maps.Map(document.getElementById("map-canvas"),
		mapOptions);
}

// loads the map after the page is loaded
google.maps.event.addDomListener(window, 'load', initialize);

/**
* Moves the map based on the direction specified
**/
function moveMap(direction) {

 	getLatLngAndZoom();

	switch (direction) {
		case "N":
			lat += latLngStep; 
			break;
		case "S":
			lat -= latLngStep; 
			break;
		case "W":
			lng -= latLngStep; 
			break;
		case "E":
			lng += latLngStep; 
			break;
	}

	map.panTo(new google.maps.LatLng(lat, lng)); 
}

/**
* Zooms the map based on the direction specified
* @direction - true if zoom in, false means zoom out
**/
function zoomMap(direction) {

	getLatLngAndZoom();

	if (direction) 
		zoom += zoomStep;
	else 
		zoom -= zoomStep;

	map.setZoom(zoom);

}

/**
* Retrieves and populates the lat, lng and zoom variables with the current dates
**/
function getLatLngAndZoom() {
	lat = map.getCenter().lat();
	lng = map.getCenter().lng();
	zoom = map.getZoom();
}