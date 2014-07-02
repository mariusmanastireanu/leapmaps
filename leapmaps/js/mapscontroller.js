// Generic global variables
var map;
var lat = 46.76907446541323;
var lng = 23.59061690807345;

// Radius in which a Street View is available, used in later checks and messages
var radius = 150;

// Google Maps global variables
var zoom = 10;
var latLngStep = 0.1;
var zoomStep = 1;

// Street View global variables
var panoramaZoom = 0;
var panoramaZoomStep = 0.2;

function initialize() {
	// map options
	var mapOptions = {
		center: new google.maps.LatLng(lat, lng),
		zoom: zoom,
		maxZoom: 18,
		minZoom: 3,
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
* Retrieves and populates the lat, lng and zoom variables with the current dates
**/
function getLatLngAndZoom() {
	lat = map.getCenter().lat();
	lng = map.getCenter().lng();
	zoom = map.getZoom();
}

/**
* Moves the map based on the direction specified
**/
function moveMap(direction) {

	if(!isInStreetView()) {
		getLatLngAndZoom();
		latLngStep = 1/zoom;

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
	} else {
		console.log('Not implemented yet');
	}
}

/**
* Zooms the map based on the direction specified
* @direction - true means zoom in, false means zoom out
**/
function zoomMap(direction) {

	if(!isInStreetView()) {
		// Zoom map in Google Maps mode
		getLatLngAndZoom();

		if (direction) 
			zoom += zoomStep;
		else 
			zoom -= zoomStep;

		map.setZoom(zoom);
	} else {
		// Zoom map in Street View mode
		panoramaZoom = map.getStreetView().getZoom();

		if (direction) 
			panoramaZoom += panoramaZoomStep;
		else 
			panoramaZoom -= panoramaZoomStep;

		map.getStreetView().setZoom(panoramaZoom);
	}
}

/**
* It switches the map mode between Google Maps and Street View
**/
function switchMapMode() {
	
	if(!isInStreetView()) {
		// Initialize Street View at this coordinates
		getLatLngAndZoom();

		// Check if Google has a StreetView image within 'radius' meters of the given location, and load that panorama
		var sv = new google.maps.StreetViewService();
		sv.getPanoramaByLocation(new google.maps.LatLng(lat, lng), 'radius', function(data, status) {
			if (status == 'OK') {
				var panoramaOptions = {
					pano: data.location.pano,
				};
								
				map.setStreetView(new google.maps.StreetViewPanorama(document.getElementById("map-canvas"), panoramaOptions));
				map.getStreetView().setZoom(0);
			} else {
				console.log('There is no street view panorama available for a radius of ' + radius + ' meters at this coordinates: lat: ' + lat + ', lng: ' + lng);
				console.log('Should display an warning message to the view');
			}
		});
	} else {
		// Disable Street View, switch to Google Maps
		map.getStreetView().setVisible(false);
	}
}

/**
* Returns true if the map is street view or false otherwise
**/
function isInStreetView() {
	return map.getStreetView().getVisible();
}