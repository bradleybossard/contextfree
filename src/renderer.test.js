var expect = require('chai').expect;
var fs = require('fs');
var renderer = require('./renderer');
var Canvas = require('canvas');
var async = require('async');
var rimraf = require('rimraf');
var BlinkDiff = require('blink-diff');
// Allows mocha to loop over an array of test cases.
require('it-each')({ testPerIteration: true });

var compiled = require('./testdata/compiled.json');

var height = 600;
var width = 600;
var randomNumber = 300;
var maxObjects = 1000;
// TODO(bradleybossard): This time out much higher than I would like.
// Running test with istanbul seems to make some run up to 3x longer than
// with just plain mocha.
var testTimeout = 5000;
var expectedDirname = "./src/testdata/expected";
var actualDirname = "./src/testdata/actual";
var outputDirname = "./src/testdata/output";

// This test loops over compiled CFDGs and compares the rendered
// results to pre-rendered golden test data.
describe('renderer', function() {
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext('2d');

  var keys = Object.keys(compiled);

	before(function(done) {
		async.series([function(callback) {
			// Create directory for actuals test comparison
			if (!fs.existsSync(actualDirname)){
				fs.mkdirSync(actualDirname);
				callback();
			}
		}, function(callback) {
			// Create directories to put perceptual diff output
			if (!fs.existsSync(outputDirname)){
				fs.mkdirSync(outputDirname);
				callback();
			}
		// Signal to mocha we are done.
		}, function() {
			done();
		}]);
  });

  // Delete resulting test and pdiff images.
	after(function(done) {
		async.series([function(callback) {
			if (fs.existsSync(actualDirname)){
				rimraf(actualDirname, function(err) {
					if (err) { throw err };
					callback();
				});
			}
		}, function(callback) {
			if (fs.existsSync(outputDirname)){
				rimraf(outputDirname, function(err) {
					if (err) { throw err };
					callback();
				});
			}
		// Signal to mocha we are done.
		}, function() {
			done();
		}]);
	});

  // TODO(bradleybossard): it.each allows you to name tests individually. To do
  // this, test cases need to be in array format.
  it.each(keys, 'should render image which pdiff passes golden image', function(key, next) {
    this.timeout(testTimeout);
		var compiledTree = compiled[key];

		var render = renderer.render(compiledTree, canvas, randomNumber, maxObjects);

		canvas.toBuffer(function(err, buf) {
			if (err) {
				console.log(err);
				throw err;
			}
			var expectedFilename = expectedDirname + '/' + key + '.png';
			var actualFilename = actualDirname + '/' + key + '.png';
			var outputFilename = outputDirname + '/' + key + '.png';
			fs.writeFile(actualFilename, buf, function() {
				var diff = new BlinkDiff({
					imageAPath: actualFilename,
					imageBPath: expectedFilename,
					thresholdType: BlinkDiff.THRESHOLD_PERCENT,
					threshold: 0.01,
					imageThreshold: 0.005,
					imageOutputPath: outputFilename 
				});

				diff.run(function (error, result) {
					if (error) {
						throw error;
					} else {
						expect(diff.hasPassed(result.code)).to.be.true;
					}
					next();
				});
			});
		});
  });
});
