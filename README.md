# camino-tracker
Map generator script for my pilgrimage of Santiago de Compostela

## Required environment variables

* `PROD_CSV` - URL of a **published** Google Sheet document in CSV format
* `HERE_APP_ID` & `HERE_APP_CODE` - credentials for the HERE Maps API access
* `TRAVIC_CI_TOKEN` - Travis CI access token for the AWS Lambda function. Can be fetched via `travis token` CLI tool
* `GITHUB_TOKEN` - Needed for the camino-website deployment via Travis CI. Set in the Travis CI dashboard.