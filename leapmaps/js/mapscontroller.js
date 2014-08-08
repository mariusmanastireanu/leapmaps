MapsController = {

	map : null,

	lat : 46.76907446541323,
	lng : 23.59061690807345,

	pitchHeadingStep : 1.35,

	streetViewRenderingRadius : 150,
	streetViewAngleThreshold : 40,

	zoom : 10,
	zoomStep : 1,
	panoramaZoomStep : 0.2,

	/**
	* It initializes the Google Map
	**/
	initialize : function() {

		var mapOptions = {
			center: new google.maps.LatLng(MapsController.lat, MapsController.lng),
			zoom: MapsController.zoom,
			maxZoom: 18,
			minZoom: 3,
			panControl: false,
			zoomControl: false,
			draggable: true			
		}

		MapsController.map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);
	},

	/**
	* Returns true if the map is street view or false otherwise
	**/
	isInStreetView : function () {
		return MapsController.map.getStreetView().getVisible();
	},

	/**
	* Pans the map with newX on horizontal and newY on vertical
	* 
	* newX : horizontal pixels
	* newY : vertical pixels
	**/
	panBy : function (newX, newY) {
		if(!MapsController.isInStreetView()) {
			if (newX != 0 || newY != 0) {
				MapsController.map.panBy(newX, newY);
			}
		}
	},

	/**
	* Moves the map based on the direction specified
	**/
	moveMap : function (newLat, newLng) {
		if(!MapsController.isInStreetView()) {
			MapsController.map.panTo(new google.maps.LatLng(newLat, newLng)); 
		}
	},

	/**
	* Rotates the map based on the direction passed as argument
	* 
	* direction : direction
	**/
	rotate360 : function (direction) {
		if (MapsController.isInStreetView()) {
			var pitch = MapsController.map.getStreetView().getPov().pitch;
			var heading = MapsController.map.getStreetView().getPov().heading;

			switch (direction) {
				case "N":
					pitch += MapsController.pitchHeadingStep;
					break;
				case "S":
					pitch -= MapsController.pitchHeadingStep;
					break;
				case "E":
					heading += MapsController.pitchHeadingStep;
					break;
				case "W":
					heading -= MapsController.pitchHeadingStep;
					break;
			}

			MapsController.map.getStreetView().setPov({
						heading : heading,
						pitch : pitch
			});
		}
	},


	/**
	* Zooms the map based on the direction specified
	*
	* zoomIn : true means zoom in, false means zoom out
	**/
	zoomMap : function (zoomIn) {
		if(!isInStreetView()) {
			// Zoom map in Google Maps mode
			var zoom = MapsController.map.getZoom();

			if (zoomIn) 
				zoom += zoomStep;
			else 
				zoom -= zoomStep;

			MapsController.map.setZoom(zoom);
		} else {
			// Zoom map in Street View mode
			var panoramaZoom = MapsController.map.getStreetView().getZoom();

			if (direction) 
				panoramaZoom += panoramaZoomStep;
			else 
				panoramaZoom -= panoramaZoomStep;

			MapsController.map.getStreetView().setZoom(panoramaZoom);
		}
	},

	/**
	* Moves the street view point of view based on the direction passed as argument
	* 
	* direction : true if forward, false otherwise
	**/
	moveStreetView : function (direction) {
		if(MapsController.isInStreetView()) {
			var heading = MapsController.map.getStreetView().getPov().heading;
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

			for(var i = 0; i < MapsController.map.getStreetView().getLinks().length; i++) {
				var thisHeading = MapsController.map.getStreetView().getLinks()[i].heading;
				console.log('avl.heading: ' + thisHeading);
				if (heading > thisHeading - MapsController.streetViewAngleThreshold && 
						heading < thisHeading + MapsController.streetViewAngleThreshold) {
					MapsController.map.getStreetView()
						.setPano(MapsController.map.getStreetView().getLinks()[i].pano);
					
					if(!direction) {
						thisHeading = thisHeading - 180;
						if (thisHeading < 0) {
							thisHeading += 360;
						} 
					}

					MapsController.map.getStreetView().setPov({
						heading : thisHeading,
						pitch: MapsController.map.getStreetView().getPov().pitch
					});
				}
			}
		}
	},

	/**
	* It switches the map mode between Google Maps and Street View
	**/
	switchMapMode : function () {
		
		if(!MapsController.isInStreetView()) {
			var lat = MapsController.map.getCenter.lat();
			var lng = MapsController.map.getCenter.lng();

			// Check if Google has a StreetView image within 'radius' meters of the given location, and load that panorama
			var sv = new google.maps.StreetViewService();
			sv.getPanoramaByLocation(new google.maps.LatLng(lat, lng), 'MapsController.streetViewRenderingRadius', function(data, status) {
				if (status == 'OK') {
					var panoramaOptions = {
						pano: data.location.pano,
					};
									
					MapsController.map.setStreetView(new google.maps.StreetViewPanorama(document.getElementById("map-canvas"), panoramaOptions));
					MapsController.map.getStreetView().setZoom(0);
				} else {
					console.log('There is no street view panorama available for a radius of ' + radius + ' meters at this coordinates: lat: ' + lat + ', lng: ' + lng);
					console.log('Should display an warning message to the view');
				}
			});
		} else {
			// Disable Street View, switch to Google Maps
			MapsController.map.getStreetView().setVisible(false);
		}
	}	
}