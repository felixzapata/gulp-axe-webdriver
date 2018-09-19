'use strict';

var axe = require('../index');
var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
require('mocha');

var fixtures = function (glob) { return path.join(__dirname, './fixtures', glob); }

function fileExists(filePath) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (err) {
		return false;
	}
}

describe('gulp-axe-webdriver', function () {

	var output;
	var write = process.stdout.write;
	this.timeout(30000);

	beforeEach(function (done) {
		var folder = path.join(__dirname, 'temp');
		output = '';
		process.stdout.write = function (str) {
			output += str;
		};
		fs.remove(folder, done);
	});

	afterEach(function () {
		process.stdout.write = write;
	});

	describe('using Chrome', function () {

		it('should pass the a11y validation', function () {
			var options = {
				urls: [fixtures('working.html')]
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/Found no accessibility violations./gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/working.html)/gi), null);
			});

		});


		it('should not pass the a11y validation', function () {
			var options = {
				urls: [fixtures('broken.html')]
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/Found 3 accessibility violations/gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
			});
		});

		it('should create JSON file with the results', function () {
			var options = {
				saveOutputIn: 'allHtml.json',
				folderOutputReport: path.join(__dirname, 'temp'),
				urls: [fixtures('broken.html')]
			};
			var expected = path.join(__dirname, 'temp', 'allHtml.json');
			return axe(options).then(function () {
				assert(fileExists(expected), true);
			});
		});
	});

	describe('using CSS selector', function () {
		it('should use add a CSS selector to the list of elements to include in analysis', function () {
			var options = {
				urls: [fixtures('broken.html')],
				include: 'img'
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/Found 1 accessibility violations/gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
			});
		});

		it('should use add a CSS selector to the list of elements to exclude in analysis', function () {
			var options = {
				urls: [fixtures('broken.html')],
				exclude: '#no-label'
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/Found 2 accessibility violations/gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
			});
		});

	})

	describe('using showOnlyViolations option', function () {
		it('should only returns the violations', function () {
			var options = {
				urls: [fixtures('broken.html', 'working.html')],
				saveOutputIn: 'allHtml.json',
				showOnlyViolations: true,
				folderOutputReport: path.join(__dirname, 'temp')
			};
			var expected = path.join(__dirname, 'temp', 'allHtml.json');
			var results;
			return axe(options).then(function () {
				results = JSON.parse(fs.readFileSync(expected, 'utf8'));
				assert.equal(results.length, 1);
				assert.equal(results[0].passes, null);
				assert.notEqual(results[0].violations, null);
			});
		});
	});

	describe('using verbose option', function () {
		it('should show information messages about the analysis', function () {
			var options = {
				urls: [fixtures('working.html')],
				verbose: true
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/Preparing results/gi), null);
				assert.notEqual(output.match(/Start reading the urls/gi), null);
				assert.notEqual(output.match(/Analysis start for: /gi), null);
				assert.notEqual(output.match(/Analysis finished for: /gi), null);
			});
		});
	});

	describe('using a11yCheckOptions', function () {
		it('should override the rules', function () {
			var options = {
				urls: [fixtures('broken.html')],
				a11yCheckOptions: {
					'rules': {
						'html-has-lang': { enabled: false }
					}
				}
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/Found 2 accessibility violations/gi), null);
				assert.equal(output.match(/<html> element must have a lang attribute/gi), null);
			});
		});
	});

	describe('detect 404 errors', function() {
		it('should show a not valid url or resource', function () {
			var options = {
				urls: ['http://www.estaurlnoexiste.com/']
			};
			return axe(options).then(function () {
				assert.notEqual(output.match(/File to test: http:\/\/www.estaurlnoexiste.com\//gi), null);
				assert.notEqual(output.match(/URL not valid for analysis/gi), null);
			});
		});
	});

	describe('using errorOnViolation', function () {
		it('should throw on a11y validation', function () {
			var options = {
				urls: [fixtures('broken.html')],
				errorOnViolation: true,
				headless: true
			};
			return axe(options).catch(function(error) {
				assert.notEqual(error.message.match(/Encountered 1 axe violation errors/gi), null);
			});
		});
	});

});
