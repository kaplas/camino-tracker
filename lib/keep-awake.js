var http = require("http");

module.exports = function keepMeAwake() {
  setInterval(function() {
    http.get("http://jounis-camino-tracker.herokuapp.com");
    http.get("http://requestb.in/wyrv1wwy");
  }, 300000); // every 5 minutes (300000)
}