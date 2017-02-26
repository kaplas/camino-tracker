const Bluebird = require('bluebird');
const csv = require('csvtojson');
const fetch = require('node-fetch');
const find = require('array.prototype.find');
const get = require('lodash.get');
const moment = require('moment');

moment.locale('en');

const originalCsvURL = process.env.PROD_CSV;

const csvToJsonAsync = content => new Promise((resolve, reject) => {
  var entries = [];
  csv({})
    .fromString(content)
    .on('json', (json) => { entries.push(json); })
    .on('done',(error)=>{
      error ? reject(error) : resolve(entries);
    });
});

const bodyForGeocodingRequest = entries => entries
  .map(entry => `id=${entry.index}&prox=${entry.latitude},${entry.longitude},50`)
  .join("\n");

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

Bluebird.resolve(true)
  .then(() => fetch(originalCsvURL))
  .then(res => res.text())
  .then(body => "date,image,latitude,longitude,shareUrl\r\n" + body)
  .then(csvToJsonAsync)
  .then(entries => entries.map(entry => ({
    moment: moment(entry.date, 'MMMM D, YYYY at hh:mmA'),
    latitude: entry.latitude,
    longitude: entry.longitude
  })))
  .then(entries => entries.filter(entry => entry.moment.isValid()))
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
  .then(entries => Bluebird.join(entries, getPlacesAsync(entries)))
  .spread((entries, places) => {
    return entries.map(entry => {
      const place = find(places, item => item.ItemId === entry.index);
      entry.place = get(place, 'Result[0].Location.Address.Label', '');
      return entry;
    });
  })
  .then(entries => console.log(JSON.stringify(entries, null, 2)));
