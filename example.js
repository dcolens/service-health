/**
 * Sample code, do npm install express to run it.
 */
'use strict';
var express = require('express');
var app = express();

var health = require('./api-health.js');

health.set({
    consecutiveFailures: 10, 
    failThreshold: 500
});

app.use(health.middleware);

app.get('/health', function(req, res) {
    res.sendStatus(health.status());
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
