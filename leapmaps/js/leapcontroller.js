///////////////////////////////////////////////////////////////////
// doc: https://developer.leapmotion.com/getting-started/javascript


var hand, finger;

var numberOfZoomIn = 0;
var numberOfZoomOut = 0;

var switchMode = 0;


// Leap.loop uses browser's requestAnimationFrame
var leapOptions = { 
  enableGestures: true 
};

var controller = Leap.loop(leapOptions, function(frame){
    //... handle frame data
    if(frame.valid && frame.gestures.length > 0) {
      frame.gestures.forEach(function(gesture) {
        // Classifying the type of gesture detected by the Leap Motion Controller
        switch (gesture.type){
          case "circle":
              handleCircle(frame, gesture);
              break;
          case "keyTap":
              handleKeyTap(frame, gesture);
              break;
          case "screenTap":
              console.log("Screen Tap Gesture");
              break;
          case "swipe":
              handleSwipe(gesture);
              break;
        }
    });
  }
});

/**
* Handles the circle gesture. 
* Based on its direction it should zoom in or zoom out the map
**/
function handleCircle(frame, gesture) {
  switchMode = 0;

  var clockwise = false;
  var pointableID = gesture.pointableIds[0];
  var direction = frame.pointable(pointableID).direction;

  // This check solves a small bug
  // When making a circle with an pointable object (such as a pen)
  // Sometimes the direction is 'undefined'
  if (direction) {
    var dotProduct = Leap.vec3.dot(direction, gesture.normal);

    if (dotProduct  >  0) 
      clockwise = true;

    if (clockwise) {
      numberOfZoomIn++;

      if (numberOfZoomIn == 10) {
        numberOfZoomIn = 0 ;
        zoomMap(clockwise);
      }
    } else {
      numberOfZoomOut++;

      if (numberOfZoomOut == 10) {
        numberOfZoomOut = 0;
      zoomMap(clockwise);
      }
    }
  }
}

/**
* Handles the key type gesture
**/
function handleKeyTap(frame, gesture) {
  var handIds = gesture.handIds;
  handIds.forEach(function(handId) {
    var hand = frame.hand(handId);
    
      switchMode++;
  
      if (switchMode == 3) {
        switchMapMode();
        switchMode = 0;
      }
  });
}

/**
* Handles the swipe gesture.
* Based on its type it should move the map
**/
function handleSwipe(gesture) {
  switchMode = 0;

  //Classify swipe as either horizontal or vertical
  var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

  if(isHorizontal) {
      // Horizontal swipe
      if(gesture.direction[0] > 0) {
          swipeDirection = "E";
      } else {
          swipeDirection = "W";
      }
  } else { 
      // Vertical swipe
      if(gesture.direction[1] > 0){
          swipeDirection = "N";
      } else {
          swipeDirection = "S";
      }                  
  }

  if(isInStreetView())
    rotate360(swipeDirection);
  else 
    moveMap(swipeDirection);
}

/**
* Helper function to identify the type of the finger detected by Leap Motion Controller
**/
function getFingerName(fingerType) {
  switch(fingerType) {
    case 0:
      return 'Thumb';
    break;

    case 1:
      return 'Index';
    break;

    case 2:
      return 'Middle';
    break;

    case 3:
      return 'Ring';
    break;

    case 4:
      return 'Pinky';
    break;
  }
}