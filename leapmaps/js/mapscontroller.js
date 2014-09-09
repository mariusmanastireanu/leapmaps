MapsController = {

	map : null,

	lat : 46.76907446541323,
	lng : 23.59061690807345,

	pitchHeadingStep : 7.5,

	streetViewRenderingRadius : 150,
	streetViewAngleThreshold : 40,

	zoom : 10,
	zoomStep : 1,
	panoramaZoomStep : 0.2,

	markers : [],

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
				case "fromBottomToTop":
					if (pitch < 90 - MapsController.pitchHeadingStep)
						pitch += MapsController.pitchHeadingStep;
					break;
				case "fromTopToBottom":
					if (pitch > -90 + MapsController.pitchHeadingStep)
						pitch -= MapsController.pitchHeadingStep;
					break;
				case "fromLeftToRight":
					heading += MapsController.pitchHeadingStep;
					break;
				case "fromRightToLeft":
					heading -= MapsController.pitchHeadingStep;
					break;
			}

			heading = heading % 360;

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
		if(!MapsController.isInStreetView()) {
			// Zoom map in Google Maps mode
			var zoom = MapsController.map.getZoom();

			if (zoomIn) 
				zoom += MapsController.zoomStep;
			else 
				zoom -= MapsController.zoomStep;

			MapsController.map.setZoom(zoom);
		} else {
			// Zoom map in Street View mode
			var panoramaZoom = MapsController.map.getStreetView().getZoom();

			if (direction) 
				panoramaZoom += MapsController.panoramaZoomStep;
			else 
				panoramaZoom -= MapsController.panoramaZoomStep;

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

			for(var i = 0; i < MapsController.map.getStreetView().getLinks().length; i++) {
				var thisHeading = MapsController.map.getStreetView().getLinks()[i].heading;
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
	* Should add or remove a marker from the map.
	*
	* x : the x position on the screen
	* y : the y position on the screen
	**/
	addRemoveMarker : function(x, y) {
		var marker = new google.maps.Marker({
      position: MapsController.fromPixelToLatLng(x, y),
      map: MapsController.map
  	});
  	MapsController.markers.push(marker);
	},

	/**
	* It switches the map mode between Google Maps and Street View
	*
	* x : the x position on the screen
	* y : the y position on the screen
	**/
	switchMapMode : function (x, y) {
		if(!MapsController.isInStreetView()) {
      var newLatLng = MapsController.fromPixelToLatLng(x, y);

			// Check if Google has a StreetView image within 'radius' meters of the given location, and load that panorama
			var sv = new google.maps.StreetViewService();
			sv.getPanoramaByLocation(newLatLng, MapsController.streetViewRenderingRadius, function(data, status) {
				if (status == 'OK') {
					var panoramaOptions = {
						pano: data.location.pano
					};
									
					MapsController.map.setStreetView(new google.maps.StreetViewPanorama(document.getElementById("map-canvas"), panoramaOptions));
					MapsController.map.getStreetView().setZoom(0);
				} else {
					alert('There is no street view panorama available for a radius of ' 
						+ MapsController.streetViewRenderingRadius 
						+ ' meters at this coordinates: ' 
						+ 'lat: ' + newLatLng.lat() 
						+ ', lng: ' + newLatLng.lng() 
						+ '\n\nPlease try again');
				}
			});
		} else {
			// Disable Street View, switch to Google Maps
			MapsController.map.getStreetView().setVisible(false);
		}
	},

	/**
	* Converts a Google Point into Google LatLng Object
	*
	* point : Google Point
	* z : Zoom level
	**/
	fromPointToLatLng : function (point, z) {
		var scale = Math.pow(2, z);
		var normalizedPoint = new google.maps.Point(point.x / scale, point.y / scale);
		return latLng = MapsController.map.getProjection().fromPointToLatLng(normalizedPoint);
	},

	/**
	* Converts a pixel on the screen into a Google LatLng Object
	*
	* x : x coordinate on the screen
	* y : y coordinate on the screen
	**/
	fromPixelToLatLng : function(x, y) {
		console.log(x + "..." + y);
		// retrieve the lat lng for the far extremities of the (visible) map
	  var latLngBounds = MapsController.map.getBounds();
	  var neBound = latLngBounds.getNorthEast();
	  var swBound = latLngBounds.getSouthWest();

	  // convert the bounds in points
	  var neBoundInPx = MapsController.map.getProjection().fromLatLngToPoint(neBound);
	  var swBoundInPx = MapsController.map.getProjection().fromLatLngToPoint(swBound);

	  // compute the percentage of x and y coordinates 
	  // related to the div containing the map
	  var procX = x/$("#map-canvas").width();
	  var procY = y/$("#map-canvas").height();

	  // compute new coordinates in google points for lat and lng;
	  // for lng : subtract from the right edge of the container the left edge, 
	  // multiply it by the percentage where the x coordinate was on the screen
	  // related to the container in which the map is placed and add back the left boundary
	  // same for lat
	  var newLngInPx = (neBoundInPx.x - swBoundInPx.x) * procX + swBoundInPx.x;
	  var newLatInPx = (swBoundInPx.y - neBoundInPx.y) * procY + neBoundInPx.y;

	  // convert the google.maps.Point in LatLng
	  return newLatLng = MapsController.map.getProjection().fromPointToLatLng(new google.maps.Point(newLngInPx, newLatInPx));
	}
}