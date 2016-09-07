'use strict';

var axe = require('../index');
var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
require('mocha');

var fixtures = function(glob) { return path.join(__dirname, './fixtures', glob); }

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

describe('gulp-axe-webdriver', function() {

	var output;
	var write = process.stdout.write;
	this.timeout(30000);

	beforeEach(function(done) {
    var folder = path.join(__dirname, 'temp');
		output = '';
    process.stdout.write = function(str) {
      output += str;
    };
    fs.remove(folder, done);
	});

	afterEach(function() {
    process.stdout.write = write;
  });

	describe('using Chrome', function() {

		it('should pass the a11y validation', function (done) {
			var options = {
				urls: [fixtures('working.html')]
			};
			return axe(options, function() {
				assert.notEqual(output.match(/Found no accessibility violations./gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/working.html)/gi), null);
				done();
			});
			
		});


		it('should not pass the a11y validation', function (done) {
				var options = {
					urls: [fixtures('broken.html')]
				};
				return axe(options, function() {
						assert.notEqual(output.match(/Found 3 accessibility violations/gi), null);
						assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
						done();
				});
		});

		it('should create JSON file with the results', function (done) {
			var options = {
				saveOutputIn: 'allHtml.json',
				folderOutputReport: path.join(__dirname, 'temp'),
				urls: [fixtures('broken.html')]
			};
			var expected = path.join(__dirname, 'temp', 'allHtml.json');
			return axe(options, function() {
				assert(fileExists(expected), true);
				done();
			});
		});
	})

	describe('using PhantomJS', function() {
		it('should pass the a11y validation', function (done) {
				var options = {
					urls: [fixtures('working.html')],
					browser: 'phantomjs'
				};
				return axe(options, function() {
						assert.notEqual(output.match(/Found no accessibility violations./gi), null);
						assert.notEqual(output.match(/(File to test|test\/fixtures\/working.html)/gi), null);
						done();
				});
		});


		it('should not pass the a11y validation', function (done) {
				var options = {
					urls: [fixtures('broken.html')],
					browser: 'phantomjs'
				};
				return axe(options, function() {
					assert.notEqual(output.match(/Found 3 accessibility violations/gi), null);
					assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
					done();
				});
		});
		it('should create JSON file with the results', function (done) {
			var options = {
				urls: [fixtures('broken.html')],
				saveOutputIn: 'allHtml.json',
				folderOutputReport: path.join(__dirname, 'temp'),
				browser: 'phantomjs'
			};
			var expected = path.join(__dirname, 'temp', 'allHtml.json');
			return axe(options, function() {
				assert(fileExists(expected), true);
				done();
			});
		});
	});
});