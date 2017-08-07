var mymap = L.map('mapid').setView([54.98, -1.61], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoicGFhYXQiLCJhIjoiY2o1ZmFyZGg2MHg0ZzMzcnllejRjYnBobiJ9.iktT5ifPtfphaeOKUCQhkw'
}).addTo(mymap);


var sensorsJSON = [];
var mapMarkers = [];
getData(); //this calls the function that retrieves the current sensor data from
//Urban Observatory



// var no2Button = document.getElementById('no2');
// var noButton = document.getElementById('no1');
// var coButton = document.getElementById('co');
// var allButton = document.getElementById('all');
//
// noButton.onclick = handle();
//
// function handle(){
//   console.log("niox");
// }

function getData() {
  console.log("Retrieving Data...");
  return $.ajax({
    url: "http://uoweb1.ncl.ac.uk/api/v1/sensors/live.json?sensor_type=Air%20Quality&api_key=ijme39nrfrtuj8gz6ny4cvq1sp0gf5uto7p80v5kmvnhf5l86bxqlk33zap5x0wtwfur66x34fslel1j1g2h6jdxfs",
    type: "get",
    contentType: "json",

    success: function(data) { //the data variable is what the server returns, ie the JSON requested

      sensorsJSON = []; //this clears the array of sensors, in essence
      //deleting the old data before the new data is processed

      //var sensorsStringified = JSON.stringify(data);
      //alert(sensorsStringified);

      for (var i = 0; i < data.length; i++) {
        sensorsJSON.push(data[i]);
        console.log(data[i]);
      }
      plotNO2();
    }
  });
}

function mapOnlySensorLocations(arrayOfSensors) {
  console.log("mapping sensor locations only");
  var lat;
  var long;

  for (var i = 0; i < arrayOfSensors.length; i++) {

    lat = arrayOfSensors[i].geom.coordinates[0];
    long = arrayOfSensors[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    var id = i + 1;
    id = "" + id; //converts id to a String, which is required in addMarker when the ID is a popup

    addMarker(lat, long, id);

  }
}

function plot() {
  console.log("Plotting");
  clearMarkers(); //This clears the mapped points so they can be replaced with new ones


  if (document.getElementById('no1').checked){
    plotNO();
  }
  else if (document.getElementById('no2').checked){
    plotNO2();
  }
  else if (document.getElementById('co').checked){
    plotCO();
  }
  else if (document.getElementById('all').checked){
    plotAll(sensorsJSON);
  }
  else {
    console.log("error - no pollutant selected");
  }

}

function plotNO(){
  var level;
  var lat;
  var long;

  for (var i = 0; i < sensorsJSON.length; i++) {

    lat = sensorsJSON[i].geom.coordinates[0];
    long = sensorsJSON[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof sensorsJSON[i].data.NO !== 'undefined') {
      level = sensorsJSON[i].data.NO.data[sensorsJSON[i].latest];
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  var colour = "red";
  var message = "NO Level: " + level;

  addMarker(lat, long, message, colour);
    //NOW CHOOSE THE COLOUR THEN addMarker() IF NOLevel NOT -999
  }

}

function plotNO2(){
  var level;
  var lat;
  var long;

  for (var i = 0; i < sensorsJSON.length; i++) {

    lat = sensorsJSON[i].geom.coordinates[0];
    long = sensorsJSON[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof sensorsJSON[i].data.NO2 !== 'undefined') {
      level = sensorsJSON[i].data.NO2.data[sensorsJSON[i].latest];
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  var colour = "red";
  var message = "NO2 Level: " + level;

  addMarker(lat, long, message, colour);
    //NOW CHOOSE THE COLOUR THEN addMarker() IF NOLevel NOT -999
  }

}

function plotCO(){
  var level;
  var lat;
  var long;

  for (var i = 0; i < sensorsJSON.length; i++) {

    lat = sensorsJSON[i].geom.coordinates[0];
    long = sensorsJSON[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof sensorsJSON[i].data.CO !== 'undefined') {
      level = sensorsJSON[i].data.CO.data[sensorsJSON[i].latest];
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  var colour = "red";
  var message = "CO Level: " + level;

  addMarker(lat, long, message, colour);
    //NOW CHOOSE THE COLOUR THEN addMarker() IF NOLevel NOT -999
  }

}

function plotAll(arrayOfSensors) {
  console.log("Plotting all");
  var lat;
  var long;

  for (var i = 0; i < arrayOfSensors.length; i++) {

    lat = arrayOfSensors[i].geom.coordinates[0];
    long = arrayOfSensors[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    var no2;
    var no;
    var co;

    var latestTime = arrayOfSensors[i].latest;
    //This is necessary due to how the data is stored in the data objects.
    //The data is presented as matched pairs of the latest time and
    //the level of the pollutant as a number. The latest time is needed
    //to access the other part of the pair, which is the reading of
    //the pollutant level.

    //Not all the sensors have data for NO2, NO and CO.
    //The following section of code checks with typeof that this
    //reading exists for this object before retrieving the data if
    //it does exists or returning an error message if it does not.

    var no2Level = 0;
    var noLevel = 0;
    var coLevel = 0;

    if (typeof arrayOfSensors[i].data.NO2 !== 'undefined') {
      no2Level = arrayOfSensors[i].data.NO2.data[latestTime];
      no2 = "NO2: " + no2Level;

    } else {
      no2 = "No NO2 data from this sensor";
    }

    if (typeof arrayOfSensors[i].data.NO !== 'undefined') {
      noLevel = arrayOfSensors[i].data.NO.data[latestTime];
      no = "NO: " + noLevel;

    } else {
      no = "No NO data from this sensor";
    }

    if (typeof arrayOfSensors[i].data.CO !== 'undefined') {
      coLevel = arrayOfSensors[i].data.CO.data[latestTime];
      co = "CO: " + coLevel;
    } else {
      co = "No CO data from this sensor";
    }

    var colour = "black";
    var results = no2 + " " + no + " " + co;
    addMarker(lat, long, results, colour);
  }
}

function addMarker(lat, long, message, colour) {

  var circle = L.circle([long, lat], {
    color: colour,
    radius: 25
  }).addTo(mymap);

  mapMarkers.push(circle);

  circle.bindPopup(message).openPopup();
}

function clearMarkers() {
  //this goes through the mapMarkers array and removes all markers from the map
  //before clearing the array itself.
  for (var i = 0; i < mapMarkers.length; i++){
    mapMarkers[i].remove();
    }
    mapMarkers = [];
}

function calculateColour(no2, no, co) {



  return "red";

}

function ooo() {

  console.log("plotNO");
  document.getElementById("demo").innerHTML = "Nitrous Oxide (NO)";

}
// function plotNO(){
//
//   console.log("plotNO");
//
//
//
//
//
// }
