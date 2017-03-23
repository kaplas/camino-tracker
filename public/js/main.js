/* --------------------------------
LANGUAGE SELECTION
-------------------------------- */

function toggleDisplay(selector, value) {
  var divs = document.querySelectorAll(selector);
  [].forEach.call(divs, function(el) {
    el.style.display = value;
  });
}

function showFinnish(e) {
  e.preventDefault();
  toggleDisplay('.finnish', 'block');
  toggleDisplay('.english', 'none');
}

function showEnglish(e) {
  e.preventDefault();
  toggleDisplay('.english', 'block');
  toggleDisplay('.finnish', 'none');
}

/* --------------------------------
MAP
-------------------------------- */

// Get the HERE Maps platform object
var platform = new H.service.Platform({
  'app_id': window.HERE_APP_ID,
  'app_code': window.HERE_APP_CODE
});

// Initialize the map
var mapContainerEl = document.getElementById('map-container');
var defaultLayers = platform.createDefaultLayers();
var map = new H.Map(mapContainerEl, defaultLayers.terrain.map,
  { zoom: 10, /*center: { lat: 52.51, lng: 13.4 },*/ imprint: null });
var ui = H.ui.UI.createDefault(map, defaultLayers, 'fi-FI');
var mapEvents = new H.mapevents.MapEvents(map);
var behavior = new H.mapevents.Behavior(mapEvents);

// Create the parameters for the routing request:
var routingParameters = {
  // The routing mode:
  'mode': 'fastest;car',
  // The start point of the route:
  'waypoint0': 'geo!50.1120423728813,8.68340740740811',
  // The end point of the route:
  'waypoint1': 'geo!52.5309916298853,13.3846220493377',
  // To retrieve the shape of the route we choose the route
  // representation mode 'display'
  'representation': 'display'
};

var frenchWayRoutingParameters = {
  'mode': 'fastest;pedestrian;traffic:disabled;motorway:-2',
  'representation': 'display',

  'waypoint0': 'geo!43.165,-1.2356',
  'waypoint1': 'geo!43,-1.316667',
  'waypoint2': 'geo!42.93113,-1.50437',
  'waypoint3': 'geo!42.816667,-1.65',
  'waypoint4': 'geo!42.671117,-1.818736',
  'waypoint5': 'geo!42.666667,-2.016667',
  'waypoint6': 'geo!42.5683,-2.19218',
  'waypoint7': 'geo!42.465,-2.445556',
  'waypoint8': 'geo!42.416667,-2.733333',
  'waypoint9': 'geo!42.441944,-2.9525',
  'waypoint10': 'geo!42.41884,-3.19125',
  'waypoint11': 'geo!42.37576,-3.43634',
  'waypoint12': 'geo!42.35,-3.706667',
  'waypoint13': 'geo!42.287778,-4.138889',
  'waypoint14': 'geo!42.26786,-4.40502',
  'waypoint15': 'geo!42.333333,-4.6',
  'waypoint16': 'geo!42.371944,-5.030278',
  'waypoint17': 'geo!42.422778,-5.221389',
  'waypoint18': 'geo!42.605556,-5.57',
  'waypoint19': 'geo!42.51721,-5.76632',
  'waypoint20': 'geo!42.458889,-6.063333',
  'waypoint21': 'geo!42.48084,-6.28398',
  'waypoint22': 'geo!42.55,-6.583333',
  'waypoint23': 'geo!42.6075,-6.8075',
  'waypoint24': 'geo!42.72599,-7.01938',
  'waypoint25': 'geo!42.7802,-7.41375',
  'waypoint26': 'geo!42.80623,-7.61817',
  'waypoint27': 'geo!42.873611,-7.869444',
  'waypoint28': 'geo!42.92676,-8.16359',
  'waypoint29': 'geo!42.877778,-8.544444'
};

// Define a callback function to process the routing response:
var onResult = function(result) {
  var route,
    routeShape,
    startPoint,
    endPoint,
    strip;
  if(result.response.route) {
    // Pick the first route from the response:
    route = result.response.route[0];
    // Pick the route's shape:
    routeShape = route.shape;

    // Create a strip to use as a point source for the route line
    strip = new H.geo.Strip();

    // Push all the points in the shape into the strip:
    routeShape.forEach(function(point) {
      var parts = point.split(',');
      strip.pushLatLngAlt(parts[0], parts[1]);
    });

    // Retrieve the mapped positions of the requested waypoints:
    startPoint = route.waypoint[0].mappedPosition;
    endPoint = route.waypoint[1].mappedPosition;

    // Create a polyline to display the route:
    var routeLine = new H.map.Polyline(strip, {
      style: { strokeColor: 'yellow', lineWidth: 4 }
    });

    // Add the route polyline and the two markers to the map:
    map.addObjects([routeLine]);
  }
};

function addMarker(lat, lon) {
  map.addObject(new H.map.Marker({ lat: lat, lng: lon }));
}

function addMarkerAndBubble(lat, lon, text) {
  addMarker(lat, lon);
  ui.addBubble(new H.ui.InfoBubble({ lat: lat, lng: lon },
    { content: '<span class="bubble-text">' + text + '</span>' }));
}

var crucialPoints = new H.geo.Strip();
function addMarkerForCrucialPoint(lat, lon, text) {
  addMarkerAndBubble(lat, lon, text);
  crucialPoints.pushLatLngAlt(lat, lon);
}

// Add known start and end locations as well as my current location
addMarkerForCrucialPoint(43.165, -1.2356, 'Saint-Jean-Pied-de-Port');
addMarkerForCrucialPoint(42.877778, -8.544444, 'Santiago de Compostela');
var lastEntry = window.locationEntries[window.locationEntries.length - 1];
var distanceLeft = '769';
if (lastEntry) {
  addMarkerForCrucialPoint(lastEntry.latitude, lastEntry.longitude, lastEntry.place);
  //addMarkerForCrucialPoint(42.605556, -5.57, 'Temp place (Leon)'); // TEMP

  // Stupid calculation for getting distance to Santiage de Compostela
  var stJeanPoint = new H.geo.Point(43.165, -1.2356);
  var santiagoPoint = new H.geo.Point(42.877778, -8.544444);
  var myPoint = new H.geo.Point(lastEntry.latitude, lastEntry.longitude);
  //var myPoint = new H.geo.Point(42.605556, -5.57); // TEMP
  var doneKm = myPoint.distance(stJeanPoint);
  var leftKm = myPoint.distance(santiagoPoint);
  distanceLeft = Math.round((leftKm / (doneKm + leftKm)) * 769); // French Route is actually 769 km
}

// Add map markers for most important location entries
window.locationEntries.forEach(function(entry) {
  if (entry !== lastEntry && entry.marker) {
    addMarker(entry.latitude, entry.longitude);
  }
});

// Center map to those crucial points
function recenterMap() {
  map.getViewPort().resize();
  map.setViewBounds(crucialPoints.getBounds());
  map.setCenter(crucialPoints.getBounds().getCenter());
}
recenterMap();
// Redraw the map if the container resizes
window.addEventListener('resize', recenterMap);



// Get an instance of the routing service:
var router = platform.getRoutingService();

// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):
router.calculateRoute(frenchWayRoutingParameters, onResult,
  function(error) {
    alert(error.message);
  });

/* --------------------------------
LOCATION LIST
-------------------------------- */

var locationListEl = document.getElementById('location-list');
window.locationEntries.forEach(function(entry) {
  if (locationListEl && entry.marker) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(entry.date + ": " + entry.place));
    locationListEl.appendChild(li);
  }
});

var currentLocationEl = document.querySelector('.current-location')
if (lastEntry && currentLocationEl) {
  currentLocationEl.innerText = lastEntry.place;
}

var divs = document.querySelectorAll('.distance-left');
[].forEach.call(divs, function(el) {
  el.innerText = distanceLeft;
});

/* --------------------------------
MAP MODE
-------------------------------- */

if (window.location.hash === '#map') {
  document.body.appendChild(mapContainerEl);
  var mainContainerEl = document.getElementById("main-container");
  mainContainerEl.parentNode.removeChild(mainContainerEl);
  mapContainerEl.className = 'map-mode';
  recenterMap();
}