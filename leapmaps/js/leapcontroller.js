///////////////////////////////////////////////////////////////////
// doc: https://developer.leapmotion.com/getting-started/javascript

var hand, finger;

var numberOfClockwise = 0;
var numberOfCounterClockwise = 0;

var switchMode = 0;


// Leap.loop uses browser's requestAnimationFrame
var leapOptions = { 
  enableGestures: true 
};


var controller = Leap.loop(leapOptions, function(frame) {
  // TODO zoom v2.
  // zoomV2(frame);


  //... handle frame data
  if(frame.valid && frame.gestures.length > 0) {
    frame.gestures.forEach(function(gesture) {
      // Classifying the type of gesture detected by the Leap Motion Controller
      switch (gesture.type) {
        case "circle":
            // TODO : uncomment this
            handleCircle(frame, gesture);
            break;
        case "keyTap":
            // TODO : uncomment this
            // handleKeyTap(frame, gesture);
            break;
        case "screenTap":
            // TODO : uncomment this
            // console.log("Screen Tap Gesture");
            break;
        case "swipe":
            // TODO : uncomment this
            handleSwipe(gesture);
            break;
      }
  });
  }
});

function isOneHand(frame) {
  return frame.hands.length == 1 && frame.hands[0].confidence > 0.75;
}

/**
* Handles the circle gesture. 
* Based on its direction it should zoom in or zoom out the map
**/
function handleCircle(frame, gesture) {
  switchMode = 0;

  console.log('circle');

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
      numberOfClockwise++;

      if (numberOfClockwise == 35) {
        numberOfClockwise = 0;

      if(isInStreetView())
        moveStreetView(clockwise);
      else 
        zoomMap(clockwise);
      }
    } else {
      numberOfCounterClockwise++;

      if (numberOfCounterClockwise == 35) {
        numberOfCounterClockwise = 0;
      

      if(isInStreetView())
        moveStreetView(clockwise);
      else 
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

function avgHandPosition(hand, historySamples) {
        var sum = Leap.vec3.create();
        Leap.vec3.copy(sum, hand.palmPosition);
        for(var s = 1; s < historySamples; s++){
            var oldHand = controller.frame(s).hand(hand.id)
            if(!oldHand.valid) break;
            Leap.vec3.add(sum, oldHand.palmPosition, sum);
        }
        Leap.vec3.scale(sum, sum, 1/s);
        return sum;
}

function zoomV2(frame) {
    if (isOneHand(frame)) {
      var average = avgHandPosition(frame.hands[0], 5000);
      console.log(average[1] + "..." + Math.floor(average[1] * 15));
      map.setZoom(computeZoom(average[1]));
  }
}

function computeZoom(n) {
  if (n < 70)
    return 18;
  if (n < 83)
    return 17;
  if (n < 96)
    return 16;
  if (n < 100)
    return 15;
  if (n < 113)
    return 14;
  if (n < 126)
    return 13;
  if (n < 139)
    return 12;
  if (n < 152)
    return 11;
  if (n < 165)
    return 10;
  if (n < 178)
    return 9;
  if (n < 191)
    return 8;
  if (n < 203)
    return 7;
  if (n < 227)
    return 6;
  if (n < 240)
    return 5;
  if (n < 254)
    return 4;
  else 
    return 3;
}