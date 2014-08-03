// Generic global variables
var map;
var lat = 46.76907446541323;
var lng = 23.59061690807345;

// Radius in which a Street View is available, used in later checks and messages
var radius = 150;
// Radius in which a new panorama is available
var streetViewAngleThreshold = 40;

// Google Maps global variables
var zoom = 10;
var latLngStep = 0.1;
var zoomStep = 1;

// Street View global variables
var panoramaZoom = 0;
var panoramaZoomStep = 0.2;
var pitch = 0;
var heading = 0;
var pitchHeadingStep = 1.35;

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

function getPitchAndHeading(thePanorama) {
	pitch = thePanorama.getPov().pitch;
	heading = thePanorama.getPov().heading;
}

/**
* Moves the map based on the direction specified
**/
function moveMap(direction) {
	getLatLngAndZoom();
	latLngStep = 1/zoom;

	switch (direction) {
		case "N":
			lat += latLngStep; 
			break;
		case "S":
			lat -= latLngStep; 
			break;
		case "E":
			lng -= latLngStep; 
			break;
		case "W":
			lng += latLngStep; 
			break;
	}

	map.panTo(new google.maps.LatLng(lat, lng)); 
}

function rotate360(direction) {
	var thePanorama = map.getStreetView();
	getPitchAndHeading(thePanorama);

	switch (direction) {
		case "N":
			pitch += pitchHeadingStep;
			break;
		case "S":
			pitch -= pitchHeadingStep;
			break;
		case "E":
			heading -= pitchHeadingStep;
			break;
		case "W":
			heading += pitchHeadingStep;
			break;
	}

	thePanorama.setPov({
				heading : heading,
				pitch : pitch
			});
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
* Moves the street view point of view
**/
function moveStreetView(direction) {
		heading = map.getStreetView().getPov().heading;

		heading = heading % 360;

		if (heading < 0) {
			heading += 360;
		} 

		if (!direction) {
			heading = heading - 180;
			if (heading < 0) {
				heading += 360;
			} 
		}

		console.log('my heading: ' + heading);

		for(var i = 0; i < map.getStreetView().getLinks().length; i++) {
			var thisHeading = map.getStreetView().getLinks()[i].heading;
			console.log('avl.heading: ' + thisHeading);
			if (heading > thisHeading - streetViewAngleThreshold && 
					heading < thisHeading + streetViewAngleThreshold) {
				map.getStreetView().setPano(map.getStreetView().getLinks()[i].pano);
				
				if(!direction) {
					thisHeading = thisHeading - 180;
					if (thisHeading < 0) {
						thisHeading += 360;
					} 
				}

				map.getStreetView().setPov({
					heading : thisHeading,
					pitch: map.getStreetView().getPov().pitch
				});
			}
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