LeapMotionController = {

  controller : Leap.loop({
    // options
    enableGestures: true 
  }, // function called each loop 
    function(frame) {
      if(!Controller.helpWindow) {
        // If a hand is detected, call the controller
        LeapMotionController.attachDetachCanvas(frame);

        // Compute the pixel where the hand is pointing on the screen
        var pixel = LeapMotionController.computeHandPosition(frame);
        if (pixel) {
          // Draw the cursor on the screen and 
          Controller.drawCursor(pixel.x, pixel.y);
          if (LeapMotionController.getNumberOfFingers(frame.hands[0]) == 5) {
            Controller.computePanningAcceleration(pixel.x, pixel.y);
          }
        }
      }

      LeapMotionController.detectAndHandleGestures(frame);
      LeapMotionController.logData(frame);
  }),

  /**
  * This function is only for presentation purpose
  * It will log the data from leap motion into the UI
  *
  * frame : current frame
  **/
  logData : function (frame) {
    if(document.getElementById("log-window")) {
      var frameString = "";
      frameString = "<b>Real time data: <br><hr>";

      frameString += "Google Maps: <br></b>";
      var map = MapsController.map;
      var center = map.getCenter();
      frameString += LeapMotionController.concatData("lat", center.lat());
      frameString += LeapMotionController.concatData("lng", center.lng());
      if (!MapsController.isInStreetView()) {
        frameString += LeapMotionController.concatData("Zoom", map.getZoom());
      } else {
        var streetView = map.getStreetView();
        var pov = streetView.getPov();
        frameString += LeapMotionController.concatData("Heading", pov.heading);
        frameString += LeapMotionController.concatData("Pitch", pov.pitch);

        if (streetView.getLinks()) {
          for(var i = 0; i < streetView.getLinks().length; i++) {
            frameString += LeapMotionController.concatData("Available heading " + i, streetView.getLinks()[i].heading);
          }
        }
      }

      frameString += "<hr><b>Leap Motion: <br></b>";
      frameString += LeapMotionController.concatData("frame_id", frame.id);
      frameString += LeapMotionController.concatData("Number of hands", frame.hands.length);
      frameString += LeapMotionController.concatData("Number of fingers", LeapMotionController.getNumberOfFingers(frame.hands[0]) + LeapMotionController.getNumberOfFingers(frame.hands[1]));
            
      for(var i = 0; i < frame.hands.length; i++) {
        var hand = frame.hands[i];

        frameString += "<br>";
        frameString += LeapMotionController.concatData("Hand type", hand.type);
        frameString += LeapMotionController.concatData("Hand confidence", hand.confidence);
        frameString += LeapMotionController.concatData("Hand position x", hand.palmPosition[0] + " mm");
        frameString += LeapMotionController.concatData("Hand position y", hand.palmPosition[1] + " mm");
        frameString += LeapMotionController.concatData("Hand position z", hand.palmPosition[2] + " mm");
      }

      frameString += "<br>";
      frameString += "Gestures:<br>";

      if (frame.gestures.length > 0) {
        for(var g = 0; g < frame.gestures.length; g++) {
          var gesture = frame.gestures[g];

          frameString += LeapMotionController.concatData("Gesture name", gesture.type);
          frameString += LeapMotionController.concatData("Gesture state", gesture.state);
          frameString += LeapMotionController.concatData("Gesture duration", gesture.duration + " microseconds");
          frameString += "<br>";
        }
      }



      var output = document.getElementById("log-window");
      output.innerHTML = frameString;
    }
  },

  /**
  * This function is only for presentation purpose
  **/
  concatData : function(id, data) {
    return id + ": " + data + "<br>";
  },

  /**
  * Calls the main Controller in order to attach or detach
  * the canvas for drawing the cursor pointer
  *
  * frame : current frame
  **/
  attachDetachCanvas : function (frame) {
    Controller.attachDetachCanvas(LeapMotionController.isOneHand(frame));
  },

  /**
  * Computes the hand position in  x and y coordinates
  * based on window width and height
  *
  * frame : current frame
  * return : the current pixel (x,y)
  **/
  computeHandPosition : function (frame) {
    if (frame.valid 
      && frame.hands.length == 1
      && frame.pointables.length > 0) {

      var position = frame.pointables[0].stabilizedTipPosition;
      var normalized = frame.interactionBox.normalizePoint(position, true);

      var x = $("#map-canvas").width() * normalized[0];
      var y = $("#map-canvas").height() * (1 - normalized[1]);

      var point = {
        x : x,
        y : y
      }; 

      return point;
    }
    return null;
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
              LeapMotionController.handleCircle(frame, gesture);
              break;
          case "keyTap":
              // LeapMotionController.handleKeyTap(frame, gesture);
              break;
          case "screenTap":
              LeapMotionController.handleScreenTap(frame);
              break;
          case "swipe":
              LeapMotionController.handleSwipe(gesture);
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
    if (LeapMotionController.getNumberOfFingers(frame.hands[0]) == 1
      /*&& gesture.state === "stop"*/) {
      // execute actions only if ONE finger is poining
      // solves bug while moving in maps view

      var clockwise = false;
      var pointableID = gesture.pointableIds[0];
      var direction = frame.pointable(pointableID).direction;


      // This check solves a small bug
      // When making a circle with an pointable object (such as a pen)
      // Sometimes the direction is 'undefined'
      if (direction) {
        var dotProduct = Leap.vec3.dot(direction, gesture.normal);

        if (dotProduct  >  0) {
          clockwise = true;
        }

        Controller.handleCircle(clockwise);
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
    if (LeapMotionController.isOneHand(frame)
      && LeapMotionController.getNumberOfFingers(frame.hands[0]) == 1) {
      var pixel = LeapMotionController.computeHandPosition(frame);
      if (pixel) {
        Controller.handleKeyTap(pixel);
      }
    }

  },

  /**
  * Handles the key tap gesture
  *
  * frame : current frame
  **/
  handleScreenTap : function(frame) {
    console.log('screen tap');
    if(LeapMotionController.getNumberOfFingers(frame.hands[0]) == 1) {
      var pixel = LeapMotionController.computeHandPosition(frame);
      if (pixel) {
        Controller.handleScreenTap(pixel);
      }
    }
  },

  /**
  * Handles the swipe gesture.
  * 
  * gesture : the gesture
  **/
  handleSwipe : function(gesture) {
    if (gesture.state == "stop") {
      //Classify swipe as either horizontal or vertical
      var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

      if (isHorizontal) {
          // Horizontal swipe
          if(gesture.direction[0] > 0) {
              swipeDirection = "fromLeftToRight";
          } else {
              swipeDirection = "fromRightToLeft";
          }
      } else { 
          // Vertical swipe
          if(gesture.direction[1] > 0){
              swipeDirection = "fromBottomToTop";
          } else {
              swipeDirection = "fromTopToBottom";
          }                  
      }

      Controller.handleSwipe(swipeDirection);
    }
  },

  /**
  * Returns true if only one hand is present in the interaction box 
  * 
  * frame : current frame
  **/
  isOneHand : function (frame) {
    return frame.valid && frame.hands.length == 1;
  },

  /**
  * Returns the number of extended fingers detected
  * 
  * hand : hand from which the number has to be computed
  * return : number of fingers extended
  **/
  getNumberOfFingers : function (hand) {
    var extendedFingers = 0;
    if (hand) {
      for (var f = 0; f < hand.fingers.length; f++) {
          var finger = hand.fingers[f];
          if (finger.extended) {
            extendedFingers++;
          }
      }
    }
    return extendedFingers;
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