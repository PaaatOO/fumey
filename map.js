var newcastleUponTyne = [54.971, -1.617]; //The coordinates of the city in use.
var dataURL = "http://uoweb1.ncl.ac.uk/api/v1/sensors/live.json?sensor_type=Air%20Quality&api_key=ijme39nrfrtuj8gz6ny4cvq1sp0gf5uto7p80v5kmvnhf5l86bxqlk33zap5x0wtwfur66x34fslel1j1g2h6jdxfs";
//This is the URL of the data source that will give this application JSON data
//containing air quality levels

var pollutionMap = L.map('mapid').setView(newcastleUponTyne, 14); //This creates the
//map and sets its starting view as Newcastle-upon-Tyne.

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoicGFhYXQiLCJhIjoiY2o1ZmFyZGg2MHg0ZzMzcnllejRjYnBobiJ9.iktT5ifPtfphaeOKUCQhkw'
}).addTo(pollutionMap);
//This adds the tile layer to the map, or the visual aspect. It is an open source
//tile layer from https://www.mapbox.com/


var sensorsJSON = []; //This array contains all the sensor JSON objects provided
//by the Urban Observatory. It is initiated as empty but will be filled by getData().

var mapMarkers = []; //This array contains all the point currently plotted on the
//map. It is initated as empty but will be filled by plot().

getData(); //this calls the function that retrieves the current sensor data from
//Urban Observatory, which itself calls plot() to plot the data on the map. which
//data is plotted depends on the radio button selected by the user when the data
//successfully loads. Note that the data request can sometimes take in excess of
//ten seconds to load.

autoRefreshData(120000);//this calls the auto refresh function with a time to
//wait before the next refresh of 2 minutes (in milliseconds).

function getData() {
  console.log("Retrieving Data...");
  var dataString = "Retrieving Data...";
  document.getElementById("refreshSign").innerHTML = dataString.fontcolor("red");


  return $.ajax({
    url: dataURL,
    type: "get",
    contentType: "json",

    success: function(data) { //the data variable is what the server returns, ie the JSON requested

      sensorsJSON = []; //this clears the array of sensors, in essence
      //deleting any old data before the new data is processed

      for (var i = 0; i < data.length; i++) {
        sensorsJSON.push(data[i]);
        console.log(data[i]);
      }
      plot();//This will plot whichever pollutant is selected in the radio button
      //choices in the map.html file.
      var dataString2 = "Data retrieved.";
      document.getElementById("refreshSign").innerHTML = dataString2.fontcolor("black");
    }
  });

}

function autoRefreshData(milliseconds){
      setTimeout(autoRefreshIfChecked, milliseconds);
  }

function autoRefreshIfChecked(){
  if (document.getElementById('autoRefresh').checked){
    getData();
  }
  autoRefreshData(120000);
}

function plot() { //This function chooses which pollutant to plot on the map based
  //on which option is checked by the user. It then initiates the relevent function.
  console.log("Plotting");
  clearMarkers(); //This clears the mapped points so they can be replaced with new ones


  if (document.getElementById('no2').checked){
    plotNO2(sensorsJSON);//This passes sensorsJSON as the dataset to plot.
  }
  else if (document.getElementById('nox').checked){
    plotNOx(sensorsJSON);
  }
  else if (document.getElementById('co').checked){
    plotCO(sensorsJSON);
  }
  else if (document.getElementById('all').checked){
    plotAll(sensorsJSON);
  }
  else {
    console.log("error - no pollutant selected");
    //Due to the nature of raio buttons, this should never happen.
  }

}

function plotNO2(arrayOfSensors){
  var level;
  var message;
  var lat;
  var long;
  var colour;

  for (var i = 0; i < arrayOfSensors.length; i++) {

    lat = arrayOfSensors[i].geom.coordinates[0];
    long = arrayOfSensors[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof arrayOfSensors[i].data.NO2 !== 'undefined') {
      level = arrayOfSensors[i].data.NO2.data[arrayOfSensors[i].latest];

      colour = "green";
      if (level > 45){
        colour = "orange";
      }
      if (level > 100){
        colour = "red";
      }

      if (document.getElementById('round').checked){
        level = Math.round(level * 100)/100;
      }

      message = "NO2 Level: " + level + " " + arrayOfSensors[i].data.NO2.meta.units;

  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  if (level !== -999){ //This plots the point on the map, providing this sensor
    //has data for the pollutant and has not returned the error level -999

    if(document.getElementById('redOnly').checked){
      if(colour == "red"){
          addMarker(lat, long, message, colour);
      }
      //The pollutant is only plotted if it is red while the redOnly checkbox is checked.
      //Else all colours are plotted.
    } else {
  addMarker(lat, long, message, colour);
      }
    }
  }

}


function plotNOx(arrayOfSensors){
  var NO2Level;
  var NOLevel;
  var NOxLevel; //This will be calculated by adding the NO and NO2 levels for each sensor.
  var message;
  var lat;
  var long;
  var colour;

  for (var i = 0; i < arrayOfSensors.length; i++) {

    lat = arrayOfSensors[i].geom.coordinates[0];
    long = arrayOfSensors[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof arrayOfSensors[i].data.NO !== 'undefined' && typeof arrayOfSensors[i].data.NO2 !== 'undefined') {
      NOLevel = arrayOfSensors[i].data.NO.data[arrayOfSensors[i].latest];
      NO2Level = arrayOfSensors[i].data.NO2.data[arrayOfSensors[i].latest];
      NOxLevel = NOLevel + NO2Level;

      colour = "green";
      if (NOxLevel > 45){
        colour = "orange";
      }
      if (NOxLevel > 100){
        colour = "red";
      }
      if (document.getElementById('round').checked){
        NOxLevel = Math.round(NOxLevel * 100)/100; //This plots level to two decimal places.
        //As Math.round only rounds to the nearest integer, a quick and dirty way
        //to plot to two decimal places is to multiple by 100, round, and divide
        //by 100 again to get the desired result.
      }
      message = "NOx Level: " + NOxLevel + " " + arrayOfSensors[i].data.NO.meta.units;

  } else {
    NOxLevel = -999; //an error amount. These will not be plotted.
  }



  if (NOxLevel !== -999){ //This plots the point on the map, providing this sensor
    //has data for the pollutant and has not returned the error level -999

    if(document.getElementById('redOnly').checked){
      if(colour == "red"){
          addMarker(lat, long, message, colour);
      }
      //The pollutant is only plotted if it is red while the redOnly checkbox is checked.
      //Else all colours are plotted.
    } else {
  addMarker(lat, long, message, colour);
      }
    }
  }

}

function plotCO(arrayOfSensors){
  var level;
  var message;
  var lat;
  var long;
  var colour;

  for (var i = 0; i < arrayOfSensors.length; i++) {

    lat = arrayOfSensors[i].geom.coordinates[0];
    long = arrayOfSensors[i].geom.coordinates[1];
    lat = lat - 0;
    long = long - 0; //this converts the JSON values long and lat to numbers

    if (typeof arrayOfSensors[i].data.CO !== 'undefined') {
      level = arrayOfSensors[i].data.CO.data[arrayOfSensors[i].latest];

      colour = "green";
      if (level > 3){
        colour = "orange";
      }
      if (level > 8.73){
        colour = "red";
      }

      if (document.getElementById('round').checked){
        level = Math.round(level * 100)/100;
      }
      message = "CO Level: " + level + " " + arrayOfSensors[i].data.CO.meta.units;
  } else {
    level = -999; //an error amount. These will not be plotted.
  }

  if (level !== -999){ //This plots the point on the map, providing this sensor
    //has data for the pollutant and has not returned the error level -999

    if(document.getElementById('redOnly').checked){
      if(colour == "red"){
          addMarker(lat, long, message, colour);
      }
      //The pollutant is only plotted if it is red while the redOnly checkbox is checked.
      //Else all colours are plotted.
    } else {
  addMarker(lat, long, message, colour);
      }
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
      no2 = "NO2: " + no2Level + " " + arrayOfSensors[i].data.NO2.meta.units;
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
      no = "NO: " + noLevel + " " + arrayOfSensors[i].data.NO.meta.units;
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
      co = "CO: " + coLevel + " " + arrayOfSensors[i].data.CO.meta.units;
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
    radius: 25
  }).addTo(pollutionMap);

  mapMarkers.push(circle);

  circle.bindPopup(message);
}

function clearMarkers() {
  //this goes through the mapMarkers array and removes all markers from the map
  //before clearing the array itself.
  for (var i = 0; i < mapMarkers.length; i++){
    mapMarkers[i].remove();
    }
    mapMarkers = [];
}
