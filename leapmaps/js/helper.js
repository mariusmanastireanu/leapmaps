var ws = null;
$(document).ready(function() {
if ((typeof(WebSocket) === 'undefined') &&
        (typeof(MozWebSocket) !== 'undefined')) {
    WebSocket = MozWebSocket;
}
ws = new WebSocket("ws://localhost:8081/");
ws.onmessage = populateTable;
}); 

$(".fileButton").live('click', function() {
//console.log($(this).data('file'));
if ($(this).attr('value') === "Start") {
    $(this).attr('value', "Stop");
    $(".fileButton").not(this).attr('disabled', true);
    startFile($(this).data('file'));
} else {
    $(this).attr('value', "Start");
    $(".fileButton").not(this).attr('disabled', false);
    stopFile();
}
return false;
});

function populateTable(event){
var files = event.data.split("|");
    for (var i = 0; i < files.length; i++) {
        $('#fileTable').append(files[i]
                + '<input type="button" class="fileButton" id="'+i+'" value="Start" /><br />');
        $('#'+i).data('file', files[i]);
    }
ws.onmessage = showJSON;
}                

function startFile(fileName) {
log("Playing File: " + fileName);
ws.send(fileName);
}

function stopFile() {
log("Playback cancelled by user");
ws.send("STOPJSON");
}

function showJSON(event) {
if (event.data === "EOF") {
    $(".fileButton").attr('value', 'Start');
    $(".fileButton").attr('disabled', false);
    log("Playback Complete");
} else {
    var obj = JSON.parse(event.data);
    console.log(obj);

if(obj.r) {
    console.log('r');
}
if(obj.hands.length > 0) {
    alert('hands');
}
 //   moveUp();

    var str = JSON.stringify(obj, undefined, 2);
    $('#json').html('<pre>' + str + '</pre>');
}
}      

function log(message) {
$("#status").html(message);
}  

// test - delete
function moveUp() {
    map = window.frames["map-frame"].window.map;
    var thePanorama = map.getStreetView();
    var lat = thePanorama.getPosition().lat();
    var lng = thePanorama.getPosition().lng();
    var panoramaZoom = thePanorama.getZoom();
    var streetViewPOV = thePanorama.getPov();
    var pitch = streetViewPOV.pitch;
    var heading = streetViewPOV.heading;
    pitch +=  2;
    thePanorama.setPov({
        heading: heading, 
        pitch: pitch
    });
}    