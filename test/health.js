'use strict';
var health = require('../index.js');
var assert = require('assert');
var events = require('events');

describe("health", function() {

	describe('set', function() {
		it('throws if no params', function() {
			assert.throws(
				health.set, 
				/argument should be an object/
			);
		});
		it('throws if consecutiveFailures is invalid', function() {
			assert.throws(
				function(){ health.set({consecutiveFailures:101}); },
				/"consecutiveFailures" should be number between 1 and 100/
			);
			assert.throws(
				function(){ health.set({consecutiveFailures:'coucouc'}); },
				/"consecutiveFailures" should be number between 1 and 100/
			);			
			assert.throws(
				function(){ health.set({consecutiveFailures:0}); },
				/"consecutiveFailures" should be number between 1 and 100/
			);
		});

		it('throws if failThreshold is invalid', function() {
			assert.throws(
				function(){ health.set({failThreshold:1000}); },
				/"failThreshold" should be number between 0 and 999/
			);
			assert.throws(
				function(){ health.set({failThreshold:'coucouc'}); },
				/"failThreshold" should be number between 0 and 999/
			);			
			assert.throws(
				function(){ health.set({failThreshold:-1}); },
				/"failThreshold" should be number between 0 and 999/
			);
		});

		it('accepts valid params', function() {
			assert.doesNotThrow(function() {
				health.set({consecutiveFailures: 5, failThreshold: 500});				
			});
			assert.doesNotThrow(function() {
				health.set({failThreshold: 500});				
			});
			assert.doesNotThrow(function() {
				health.set({consecutiveFailures: 5});				
			});

		});
	});

	describe('status', function() {
		it('returns 204 when no run happened yet', function() {
			assert.equal(health.status(), 204);
		});
		it('returns 204 if at least one success in last 5 runs', function() {
			for (var i = 0; i < 5; i++) {
				health.track(200);
			}
			assert.equal(health.status(), 204);
			health.track(500);
			assert.equal(health.status(), 204);
		});
		it('returns 500 if the last 5 runs failed', function() {
			for (var i = 0; i < 5; i++) {
				health.track(500);
			}
			assert.equal(health.status(), 500);
			health.track(200);
			assert.equal(health.status(), 204);
		});	

	});

	describe('track', function() {
		it('accepts pretty much anything', function() {
			assert.equal(health.track({consecutiveFailures: 5, failThreshold: 500}), false);			
			assert.equal(health.track('coucou'), false);			
			assert.equal(health.track(1000), false);			
			assert.equal(health.track(200), true);			
			assert.equal(health.track(400), true);			
		});
	});


	describe('middleware', function() {

		it('calls next', function(done) {
			health.middleware({}, new events.EventEmitter(), done);
		});

		it('calls track', function(done) {
			var res = new events.EventEmitter();
			res.statusCode = 512;
			health.track = function(r) {
				assert.equal(r, res.statusCode);
				done();
			};
			health.middleware({}, res, done);
			res.emit('finish');
		});
	});


});
