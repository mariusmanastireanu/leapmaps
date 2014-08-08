LeapMotionController = {

  switchMode : 0,
  numberOfClockwise : 0,
  numberOfCounterClockwise : 0,

  controller : Leap.loop({
    // options
    enableGestures: true 
  }, // function called each loop 
    function(frame) {

    LeapMotionController.computeHandPosition(frame);  
    LeapMotionController.detectAndHandleGestures(frame);

  }),

  /**
  * Computes the current x and y coordinates \
  * based on window width and height
  *
  * frame : current frame
  **/
  computeHandPosition : function (frame) {
    if (frame.valid 
      && frame.hands.length == 1
      && frame.pointables.length > 0) {

      var position = frame.pointables[0].stabilizedTipPosition;
      var normalized = frame.interactionBox.normalizePoint(position, true);

      var x = window.innerWidth * normalized[0];
      var y = window.innerHeight * (1 - normalized[1]);

      Controller.drawCursor(x, y);
      LeapMotionController.computeNewXandY(x, y);

    }
  },

  /**
  * This function maps the hand position, given by the arguments
  * x and y, onto the [-10,10] domain, which represents offset pixels
  * from the current position of the center of the map.
  * After the new position is computed, this function calls 
  * the google maps controller to pan the map to the new destination
  *
  * There is a safe space in the center of the screen,
  * which is defined by a ratio of 1/3 of the width and height
  * of the browser. 
  * If the hand (cursor) is positioned in the safe space, the
  * map will not pan.
  *
  * Based on the offset of the hand position (cursor) from the 
  * center of the screen, the map is panned with less pixels
  * or more pixels, simulating acceleration in movement
  * 
  * x : x coordinate
  * y : y coordinate
  **/
  computeNewXandY : function(x, y) {
    var leftSize = window.innerWidth * 0.33;
    var rightSize = window.innerWidth * 0.66;

    var topSize = window.innerHeight * 0.33;
    var bottomSize = window.innerHeight * 0.66;

    var newX = 0;
    var newY = 0;

    if (x > rightSize)
      newX = LeapMotionController.mapValueToInterval(x, rightSize, window.innerWidth, 0, 10);
    else if (x < leftSize)
      newX = LeapMotionController.mapValueToInterval(x, 0, leftSize, -10, 0);

    if (y > bottomSize)
      newY = LeapMotionController.mapValueToInterval(y, bottomSize, window.innerHeight, 0, 10);
    else if (y < topSize)
      newY = LeapMotionController.mapValueToInterval(y, 0, topSize, -10, 0);
    
    MapsController.panBy(newX, newY);
  },

  /**
  * This is a generic helper linear function that maps a value (x)  
  * from the given domain [a, b] to the given range [c, d].
  * f(a) = c and f(b) = d
  *
  * Three liniar maps are defined in order to achieve this.
  *
  *** f1: This map shifts the initial endpoint of the interval [a, b] to the origin
  *** f1(x) = x - a, therefore [a, b] --> [0, b-a]
  *
  *** f2: This scales the interval [0, b-a] so that the right endpoint becomes d-c
  *** f2(x) = x * (d - c)/(b - a)
  *** note: the length of the image interval is the same as the interval [c,d]
  *
  *** f3: This shifts [0, d-c] onto [c,d]
  *** f3(x) = x + c
  *
  * Puting it together: f(x) = f3(f2(f1(x)))
  *
  * x : the value for which the function should be computed
  * a : lowest value of the domain [a, b]
  * b : highest value of the domain [a, b]
  * c : lowest value of the range [c, d]
  * d : highest value of the range [c, d]
  *
  * return : f(x), where f: [a, b] --> [c, d]
  **/
  mapValueToInterval : function (x, a, b, c, d) {
    return Math.round(((d - c)/(b - a)) * (x - a) + c);
  },

  /**
  * Detects if a gesture is present
  * and calls the appropriate method
  *
  * frame : current frame
  **/
  detectAndHandleGestures : function (frame) {
    if(frame.valid && frame.gestures.length > 0) {
      frame.gestures.forEach( function(gesture) {
        // Classifying the type of gesture detected by the Leap Motion Controller
        switch (gesture.type) {
          case "circle":
          console.log('a circle');
              // TODO : uncomment this
              //handleCircle(frame, gesture);
              break;
          case "keyTap":
              // TODO : uncomment this
              //handleKeyTap(frame, gesture);
              break;
          case "screenTap":
              // TODO : uncomment this
              // console.log("Screen Tap Gesture");
              break;
          case "swipe":
              // TODO : uncomment this
              // handleSwipe(gesture);
              break;
        }
      });
    }
  },

  /**
  * Handles the circle gesture. 
  * 
  * frame : current frame
  * gesture : the gesture
  **/
  handleCircle : function (frame, gesture) {
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
  },

  /**
  * Handles the key type gesture
  * 
  * frame : current frame
  * gesture : the gesture
  **/
  handleKeyTap : function(frame, gesture) {
    var handIds = gesture.handIds;
    handIds.forEach(function(handId) {
      var hand = frame.hand(handId);
      
        switchMode++;
    
        if (switchMode == 3) {
          alert('switch');
          switchMapMode();
          switchMode = 0;
        }
    });
  },

  /**
  * Handles the swipe gesture.
  * 
  * gesture : the gesture
  **/
  handleSwipe : function(gesture) {
    switchMode = 0;

    //Classify swipe as either horizontal or vertical
    var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

    if (isHorizontal) {
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

    if (isInStreetView())
      rotate360(swipeDirection);
    else 
      moveMap(swipeDirection);
  },

  /**
  * Returns true if only one hand is present in the interaction box 
  * 
  * frame : current frame
  **/
  isOneHand : function (frame) {
    return frame.hands.length == 1;
  },

  /**
  * Helper function to identify the type of the finger detected by Leap Motion Controller
  *
  * fingerType : the finger type
  * returns : the name of the finger
  **/
  getFingerName : function (fingerType) {
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
}