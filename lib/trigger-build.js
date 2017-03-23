/*
  This script is used as an AWS Lambda function. It triggers the
  Travis CI build (and thus website updating process) every hour.
*/

var https = require('https');
var postData = '{"request": {"branch":"master"}}';

// An object of options to indicate where to post to
var options = {
    host: 'api.travis-ci.org',
    port: '443',
    path: '/repo/kaplas%2Fcamino-tracker/requests',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/vnd.travis-ci.2+json',
        'Travis-API-Version': '3',
        'Authorization': 'token "' + process.env.TRAVIS_CI_TOKEN + '"'
    }
};


var req = https.request(options, (res) => {
  //console.log(`STATUS: ${res.statusCode}`);
  //console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    //console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    //console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();