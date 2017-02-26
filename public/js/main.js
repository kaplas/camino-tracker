// Get the HERE Maps platform object
var platform = new H.service.Platform({
  'app_id': window.HERE_APP_ID,
  'app_code': window.HERE_APP_CODE
});

// Initialize the map
var mapContainerEl = document.getElementById('mapContainer');
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
      style: { strokeColor: 'blue', lineWidth: 10 }
    });

    // Add the route polyline and the two markers to the map:
    map.addObjects([routeLine]);
  }
};

function addMarkerAndBubble(lat, lon, text) {
  var coords = { lat: lat, lng: lon };
  map.addObject(new H.map.Marker(coords));
  ui.addBubble(new H.ui.InfoBubble(coords,
    { content: '<span class="bubble-text">' + text + '</span>' }));
}

var crucialPoints = new H.geo.Strip();
function addMarkerForCrucialPoint(lat, lon, text) {
  addMarkerAndBubble(lat, lon, text);
  crucialPoints.pushLatLngAlt(lat, lon);
}

// Add known start and end locations as well as my current location
var lastEntry = window.locationEntries[window.locationEntries.length - 1];
//addMarkerForCrucialPoint(lastEntry.latitude, lastEntry.longitude, lastEntry.place);
addMarkerForCrucialPoint(42.605556, -5.57, 'Temp place (Leon)'); // TEMP
addMarkerForCrucialPoint(43.165, -1.2356, 'Saint-Jean-Pied-de-Port');
addMarkerForCrucialPoint(42.877778, -8.544444, 'Santiago de Compostela');

// Center map to those crucial points
function recenterMap() {
  map.getViewPort().resize();
  map.setViewBounds(crucialPoints.getBounds());
  map.setCenter(crucialPoints.getBounds().getCenter());
}
recenterMap();
// Redraw the map if the container resizes
window.addEventListener('resize', recenterMap);


/*
// Get an instance of the routing service:
var router = platform.getRoutingService();

// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):
router.calculateRoute(routingParameters, onResult,
  function(error) {
    alert(error.message);
  });
*/