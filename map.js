var fumeyMap = L.map('mapid').setView([54.98, -1.61], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoicGFhYXQiLCJhIjoiY2o1ZmFyZGg2MHg0ZzMzcnllejRjYnBobiJ9.iktT5ifPtfphaeOKUCQhkw'
}).addTo(fumeyMap);


var sensorsJSON = [];
var mapMarkers = [];
getData(); //this calls the function that retrieves the current sensor data from
//Urban Observatory

function getData() {
  console.log("Retrieving Data...");
  return $.ajax({
    url: "http://uoweb1.ncl.ac.uk/api/v1/sensors/live.json?sensor_type=Air%20Quality&api_key=ijme39nrfrtuj8gz6ny4cvq1sp0gf5uto7p80v5kmvnhf5l86bxqlk33zap5x0wtwfur66x34fslel1j1g2h6jdxfs",
    type: "get",
    contentType: "json",

    success: function(data) { //the data variable is what the server returns, ie the JSON requested

      sensorsJSON = []; //this clears the array of sensors, in essence
      //deleting the old data before the new data is processed

      for (var i = 0; i < data.length; i++) {
        sensorsJSON.push(data[i]);
        console.log(data[i]);
      }
      plot();//This will plot whichever pollutant is selected in the radio button
      //choices in the map.html file. At page load this will default to NO2.
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

function plot() { //This function chooses which pollutant to plot on the map based
  //on which option is checked by the user. It then initiates the relevent function.
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
    //Due to the nature of raio buttons, this should never happen.
  }

}

function plotNO(){
  var level;
  var levelAndUnits;
  var lat;
  var long;

  for (var i = 0; i < sensorsJSON.length; i++) {

    lat = sensorsJSON[i].geom.coordinates[0];
    long = sensorsJSON[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof sensorsJSON[i].data.NO !== 'undefined') {
      level = sensorsJSON[i].data.NO.data[sensorsJSON[i].latest];
      if (document.getElementById('round').checked){
        level = Math.round(level * 100)/100; //This plots level to two decimal places.
        //As Math.round only rounds to the nearest integer, a quick and dirty way
        //to plot to two decimal places is to multiple by 100, round, and divide
        //by 100 again to get the desired result.
      }
      levelAndUnits = level + " " + sensorsJSON[i].data.NO.meta.units;
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  var colour = "green";
  if (level > 40){
    colour = "orange";
  }
  if (level > 80){
    colour = "red";
  }
  var message = "NO Level: " + levelAndUnits;

  if (level !== -999){ //This plots the point on the map, providing this sensor
    //has data for the pollutant and has not returned the error level -999
  addMarker(lat, long, message, colour);
    }
  }

}

function plotNO2(){
  var level;
  var levelAndUnits;
  var lat;
  var long;

  for (var i = 0; i < sensorsJSON.length; i++) {

    lat = sensorsJSON[i].geom.coordinates[0];
    long = sensorsJSON[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof sensorsJSON[i].data.NO2 !== 'undefined') {
      level = sensorsJSON[i].data.NO2.data[sensorsJSON[i].latest];
      if (document.getElementById('round').checked){
        level = Math.round(level * 100)/100;
      }
      levelAndUnits = level + " " + sensorsJSON[i].data.NO2.meta.units;
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  var colour = "green";
  if (level > 40){
    colour = "orange";
  }
  if (level > 80){
    colour = "red";
  }
  var message = "NO2 Level: " + levelAndUnits;

  if (level !== -999){ //This plots the point on the map, providing this sensor
    //has data for the pollutant and has not returned the error level -999
  addMarker(lat, long, message, colour);
    }
  }
}

function plotCO(){
  var level;
  var levelAndUnits;
  var lat;
  var long;

  for (var i = 0; i < sensorsJSON.length; i++) {

    lat = sensorsJSON[i].geom.coordinates[0];
    long = sensorsJSON[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof sensorsJSON[i].data.CO !== 'undefined') {
      level = sensorsJSON[i].data.CO.data[sensorsJSON[i].latest];
      if (document.getElementById('round').checked){
        level = Math.round(level * 100)/100;
      }
      levelAndUnits = level + " " + sensorsJSON[i].data.CO.meta.units;
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  var colour = "green";
  if (level > 0.3){
    colour = "orange";
  }
  if (level > 0.6){
    colour = "red";
  }


  var message = "CO Level: " + levelAndUnits;

  if (level !== -999){ //This plots the point on the map, providing this sensor
    //has data for the pollutant and has not returned the error level -999
  addMarker(lat, long, message, colour);
    }
  }

}

function plotAll(arrayOfSensors) {
  console.log("Plotting all");
  var lat;
  var long;
  var numberOfPollutants = 0; //If a sensor contains a pollutant, this variable
  //will have 1 added to it. If it still equals 0 after a particular sensor
  //has been processed, that means the sensor contains no NO2, NO or CO readings
  //and is therefore not plotted on the map.

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
      if (document.getElementById('round').checked){
        no2Level = Math.round(no2Level * 100)/100;
      }
      no2 = "NO2: " + no2Level + " " + sensorsJSON[i].data.NO2.meta.units;
      numberOfPollutants++;
    }
    else {
      no2 = "No NO2 data from this sensor";
    }

    if (typeof arrayOfSensors[i].data.NO !== 'undefined') {
      noLevel = arrayOfSensors[i].data.NO.data[latestTime];
      if (document.getElementById('round').checked){
        noLevel = Math.round(noLevel * 100)/100;
      }
      no = "NO: " + noLevel + " " + sensorsJSON[i].data.NO.meta.units;
      numberOfPollutants++;
    }
    else {
      no = "No NO data from this sensor";
    }

    if (typeof arrayOfSensors[i].data.CO !== 'undefined') {
      coLevel = arrayOfSensors[i].data.CO.data[latestTime];
      if (document.getElementById('round').checked){
        coLevel = Math.round(coLevel * 100)/100;
      }
      co = "CO: " + coLevel + " " + sensorsJSON[i].data.CO.meta.units;
      numberOfPollutants++;
    }
    else {
      co = "No CO data from this sensor";
    }

    if(numberOfPollutants > 0){ //This plots the sensor if it has at least one
      //reading for NO2, NO or CO data. The colour is black as this feature is
      //not colour coded.
    var colour = "black";
    var results = no2 + " " + no + " " + co;
    addMarker(lat, long, results, colour);
    }
    numberOfPollutants = 0; //This resets the numberOfPollutants variable.
  }
}

function addMarker(lat, long, message, colour) {

  var circle = L.circle([long, lat], {
    color: colour,
    radius: 45
  }).addTo(fumeyMap);

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
