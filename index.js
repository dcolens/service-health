'use strict';
var lastResults = [];
var consecutiveFailures = 5;
var failThreshold = 500;

/**
 * checks if `code` is a valid http code (number between 1 and 999).
 */
function isAValidCode(code) {
	if (!Number.isInteger(code) || (code<1) || (code>999)) {
		return false;
	}	
	return true;
}

/**
 * update configuration
 *
 * @param {Number} options.consecutiveFailures number of consecutive failures to consider the health to be bad
 * @param {Number} options.failThreshold HTTP code above which a response is considered to fail
 */
function set(options) {
	if (!options || typeof options !== 'object') {
		throw new Error('argument should be an object');
	}

	if (options.hasOwnProperty('consecutiveFailures')) {
		if (!Number.isInteger(options.consecutiveFailures) || (options.consecutiveFailures<1) || (options.consecutiveFailures>100)) {
			throw new Error('"consecutiveFailures" should be number between 1 and 100');
		}
		consecutiveFailures = options.consecutiveFailures;
	}

	if (options.hasOwnProperty('failThreshold')) {
		if (!isAValidCode(options.failThreshold)) {
			throw new Error('"failThreshold" should be number between 0 and 999');
		}
		failThreshold = options.failThreshold;
	}	
}


/**
 * helper to track a response
 */
function track(r) {
	if (!isAValidCode(r)) { return false; }

	if (lastResults.length>=consecutiveFailures) {
		lastResults.splice(0,1);
	} 
	lastResults.push(r);
	return true;
}

/**
 * express middleware to track http response from a server
 */
function middleware(req, res, next) {
	res.on('finish', function() {
		track(this.statusCode);
	});
	next();
}

/**
 * returns 500 if the last `consecutiveFailures` responses failed, 204 otherwise.
 */
function status() {
	if (lastResults.length < consecutiveFailures) { return 204; }
	return lastResults.some(function(v) { return v < failThreshold; }) ? 204 : 500;	
}

module.exports = {
	set: set,
	status: status,
	track: track,
	middleware: middleware
};
