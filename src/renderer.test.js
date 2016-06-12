var expect = require('chai').expect;
var fs = require('fs');
var renderer = require('./renderer');
var Canvas = require('canvas');
var async = require('async');
var rimraf = require('rimraf');
var BlinkDiff = require('blink-diff');

var compiled = require('./testdata/compiled.json');

var height = 600;
var width = 600;
var randomNumber = 300;
var maxObjects = 1000;
var expectedDirname = "./src/testdata/expected";
var actualDirname = "./src/testdata/actual";
var outputDirname = "./src/testdata/output";

// This test loops over compiled CFDGs and compares the rendered
// results to pre-rendered golden test data.
describe('renderer', function() {
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext('2d');

  var keys = Object.keys(compiled);

  // Create directory for actuals test comparison
  if (!fs.existsSync(actualDirname)){
    fs.mkdirSync(actualDirname);
  }

  // Create directories to put perceptual diff output
  if (!fs.existsSync(outputDirname)){
    fs.mkdirSync(outputDirname);
  }

  it('should render', function(done) {
    // TODO(bradleybossard): Get rid of this timeout
    this.timeout(40000);
    async.eachSeries(keys, function(key, callback) {
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
            callback();
          });
        });
      });
    }
    // Delete the actual and output directories from the tests.
    ,function cleanup() {
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
  });
});
