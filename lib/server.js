var Bluebird = require('bluebird');
var cache = require('memory-cache');
var express = require('express');
var getEntriesAsync = require('./json-content.js');
var keepMeAwake = require('./keep-awake.js');

var app = express();

app.get('/js/secrets.js', function (req, res) {
  res.set('Content-Type', 'application/javascript');
  res.send(new Buffer(`
    window.HERE_APP_ID = "${process.env.HERE_APP_ID}";
    window.HERE_APP_CODE = "${process.env.HERE_APP_CODE}";
  `));
});

function getCachedEntriesAsync() {
  var cached = cache.get('entries');
  if (cached !== null) {
    return Bluebird.resolve(cached);
  } else {
    return getEntriesAsync()
      .tap(entries => {
        cache.put('entries', entries, 10*60*1000);
      });
  }
}

app.get('/js/location-data.js', function (req, res) {
  getCachedEntriesAsync()
    .then(entries => {
      res.set('Content-Type', 'application/javascript');
      res.send(new Buffer('window.locationEntries = ' + JSON.stringify(entries, null, 2) + ';'));
    }, error => {
      res.send('Location data generation failed!');
    })
});

app.use(express.static('public'));

app.listen(process.env.PORT || 8000, function () {
  console.log('Example app listening on port ' + (process.env.PORT || 8000))
});

keepMeAwake();
