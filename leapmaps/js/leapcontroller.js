///////////////////////////////////////////////////////////////////
// doc: https://developer.leapmotion.com/getting-started/javascript


var hand, finger;


// Leap.loop uses browser's requestAnimationFrame
var leapOptions = { 
  enableGestures: true 
};

var controller = Leap.loop(leapOptions, function(frame){
    //... handle frame data
});

// Adding a listener callback to the controller
controller.on("gesture", function(gesture){
  // Classifying the type of gesture detected by the Leap Motion Controller
  switch (gesture.type){
    case "circle":
      break;
    case "keyTap":
      break;
    case "screenTap":
      break;
    case "swipe":      
    console.log(gesture.direction);
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

      moveMap(swipeDirection);

      // TODO - remove console logs
      console.log(swipeDirection);
      console.log(gesture.speed);
    }
});


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