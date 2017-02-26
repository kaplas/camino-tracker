const csv = require('csvtojson');
const fetch = require('node-fetch');
const fs = require('fs');
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

fetch(originalCsvURL)
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
      date: current.moment.format('dddd MMM Do [of] YYYY [at] H:mm'),
      latitude: current.latitude,
      longitude: current.longitude,
      marker: isMarker
    };
  }))
  .then(entries => {
    console.log(JSON.stringify(entries, null, 2));
  });
