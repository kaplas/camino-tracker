const Bluebird = require('bluebird');
const csv = require('csvtojson');
const fetch = require('node-fetch');
const find = require('array.prototype.find');
const get = require('lodash.get');
const moment = require('moment');

// Locale needs to be set to en, to be able to read month names in English
moment.locale('en');

const originalCsvURL = process.env.PROD_CSV;
const earliestDate = moment("2017-02-26 12:00");
const latestDate = moment("2017-05-13 12:00");

/*
  CSVs are a bit tricky ones to parse manually. Because of that,
  an external library will handle that for us.
*/
const csvToJsonAsync = content => new Promise((resolve, reject) => {
  var entries = [];
  csv({})
    .fromString(content)
    .on('json', (json) => { entries.push(json); })
    .on('done',(error)=>{
      error ? reject(error) : resolve(entries);
    });
});

/*
  HERE Maps Multi Reverse Geocode API requires HTTP POST content to follow a custom format
  See. https://developer.here.com/rest-apis/documentation/geocoder/topics/resource-multi-reverse-geocode.html
*/
const bodyForGeocodingRequest = entries => entries
  .map(entry => `id=${entry.index}&prox=${entry.latitude},${entry.longitude},50`)
  .join("\n");

/*
  Get district info for the location provided. The Multi Reverse Geocode API support only
  up to 100 locations; because of this, we'll find location only for the map markers.
  There shouldn't be more than 100 of those during the pilgrimage.
*/
const getPlacesAsync = entries => Bluebird.resolve(entries)
  .filter(entry => entry.marker)
  .then(filteredEntries => fetch(
    'https://reverse.geocoder.cit.api.here.com/6.2/multi-reversegeocode.json' +
    '?mode=retrieveAreas&maxresults=1&gen=9' +
    `&app_id=${process.env.HERE_APP_ID}&app_code=${process.env.HERE_APP_CODE}`,
    {
      method: 'POST',
      body: bodyForGeocodingRequest(filteredEntries),
      headers: { 'Content-Type': 'text/plain' }
    }))
  .then(res => res.json())
  .then(res => res.Response.Item);

/*
  The actual JSON generation
*/

// Enable advanced promise functions in this chain
Bluebird.resolve(true)
  // Fetch CSV content
  .then(() => fetch(originalCsvURL))
  .then(res => res.text())
  // Add header row to CSV (to ease parsing of it) and parse it
  .then(body => "date,image,latitude,longitude,shareUrl\r\n" + body)
  .then(csvToJsonAsync)
  // Parse interesting columns (including the IFTTT custom date format)
  .then(entries => entries.map(entry => ({
    moment: moment(entry.date, 'MMMM D, YYYY at hh:mmA'),
    latitude: entry.latitude,
    longitude: entry.longitude
  })))
  // Filter problematic entries away
  .then(entries => entries.filter(entry => entry.moment.isValid() &&
    entry.moment.isAfter(earliestDate) && entry.moment.isBefore(latestDate)))
  // Enrich content (eg. which entries need an actual marker)
  .then(entries => entries.map((current, index) => {
    const next = entries[index + 1];
    const isMarker = (index === 0 || !next || next.moment.isAfter(current.moment, 'day'));
    return {
      index: index,
      date: current.moment.format('dddd MMM Do [of] YYYY [at] H:mm'),
      latitude: current.latitude,
      longitude: current.longitude,
      marker: isMarker
    };
  }))
  // Add reverse geocoding data
  .then(entries => Bluebird.join(entries, getPlacesAsync(entries)))
  // Combine entries and place names
  .spread((entries, places) => {
    return entries.map(entry => {
      const place = find(places, item => item.ItemId === entry.index);
      entry.place = get(place, 'Result[0].Location.Address.Label', '');
      return entry;
    });
  })
  // Output the end result as nicely formatted JSON to stdout
  .then(entries => console.log(JSON.stringify(entries, null, 2)));
