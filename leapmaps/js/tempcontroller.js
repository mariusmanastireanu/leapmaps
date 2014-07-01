var pitchStep = 2;
var headingStep = 2;

var latLngStep = 0.1;

$(document).on("keypress", function (e) {
	// TODO - remove this			
	console.log(e.which);
	
	var thePanorama = map.getStreetView();
	if(thePanorama.getVisible()) {
		lat = thePanorama.getPosition().lat();
		lng = thePanorama.getPosition().lng();
		var panoramaZoom = thePanorama.getZoom();
		var streetViewPOV = thePanorama.getPov();
		var pitch = streetViewPOV.pitch;
		var heading = streetViewPOV.heading;
		
		switch(e.which) {
			// Up arrow - num pad
			case 56: 	pitch +=  pitchStep;
						thePanorama.setPov({
							heading: heading, 
							pitch: pitch
						});
						break;
						
			// Down arrow - num pad
			case 50: 	pitch -=  pitchStep;
						thePanorama.setPov({
							heading: heading, 
							pitch: pitch
						});
						break;
			
			// Left arrow - num pad
			case 52:	heading -= headingStep;
						thePanorama.setPov({
							heading: heading, 
							pitch: pitch
						});
						break;
						
			// Right arrow - num pad
			case 54: 	heading += headingStep;
						thePanorama.setPov({
							heading: heading, 
							pitch: pitch
						});
						break;
		
			// W key
			case 119:	lat += latLngStep; 
						thePanorama.setPosition({lat: lat, lng: lng}); 
						break;
			// A key
			case 97: 	lng -= latLngStep; 
						thePanorama.setPosition(new google.maps.LatLng(lat, lng)); 
						break;
			// S key
			case 115: 	lat -= latLngStep; 
						thePanorama.setPosition(new google.maps.LatLng(lat, lng)); 
						break;
			// D key
			case 100: 	lng += latLngStep; 
						thePanorama.setPosition(new google.maps.LatLng(lat, lng)); 
						break;
			case 93: 	panoramaZoom += 0.2; 
						thePanorama.setZoom(panoramaZoom); 
						break;
			case 91: 	panoramaZoom -= 0.2; 
						thePanorama.setZoom(panoramaZoom); 
						break;
			case 13:	thePanorama.setVisible(false);
						break;
		};
	} else {
		lat = map.getCenter().lat();
		lng = map.getCenter().lng();
		zoom = map.getZoom();
		switch(e.which) {
			// W key
			case 119:	lat += latLngStep; 
						map.panTo(new google.maps.LatLng(lat, lng)); 
						break;
			// A key
			case 97: 	lng -= latLngStep; 
						map.panTo(new google.maps.LatLng(lat, lng)); 
						break;
			// S key
			case 115: 	lat -= latLngStep; 
						map.panTo(new google.maps.LatLng(lat, lng)); 
						break;
			// D key
			case 100: 	lng += latLngStep; 
						map.panTo(new google.maps.LatLng(lat, lng)); 
						break;
			case 93: 	zoom += 1; 
						map.setZoom(zoom); 
						break;
			case 91: 	zoom -= 1; 
						map.setZoom(zoom); 
						break;
			case 13:	// Check if Google has a StreetView image within 50 meters of the given location, and load that panorama
						var sv = new google.maps.StreetViewService();
						sv.getPanoramaByLocation(new google.maps.LatLng(lat, lng), 50, function(data, status) {
							if (status == 'OK') {
								var panoramaOptions = {
									pano: data.location.pano
								};
								
								map.setStreetView(new google.maps.StreetViewPanorama(document.getElementById("map-canvas"), panoramaOptions));
							} else {
								console.log('There is no street view panorama available for this coordinates: lat: ' + lat + ', lng: ' + lng);
							}
						});
						break;
		};
	}
});