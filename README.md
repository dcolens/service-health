
Express middleware that checks if the last `consecutiveFailures` runs of a route failed, it helps keep track of the health of a service without generating extra load.

A route failure is defined as response status code being above `failThreshold`.

If there are `consecutiveFailures` consecutive failures, the health is considered bad.

#Example:

```javascript
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
```

In the above example, the /health endpoint will return 500 if the last 10 runs returned a status code >= 500 and 204 otherwise.
