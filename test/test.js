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
	let output;
	const write = process.stdout.write;
	this.timeout(30000);

	beforeEach(function (done) {
		const folder = path.join(__dirname, 'temp');
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
		it('should pass the a11y validation', function (done) {
			const options = {
				urls: [fixtures('working.html')]
			};
			axe(options, function () {
				assert.notEqual(output.match(/Found no accessibility violations./gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/working.html)/gi), null);
				done();
			});
		});

		it('should not pass the a11y validation', function (done) {
			const options = {
				urls: [fixtures('broken.html')]
			};
			axe(options, function () {
				assert.notEqual(output.match(/Found 3 accessibility violations/gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
				done();
			});
		});

		it('should create JSON file with the results', function (done) {
			const options = {
				saveOutputIn: 'allHtml.json',
				folderOutputReport: path.join(__dirname, 'temp'),
				urls: [fixtures('broken.html')]
			};
			const expected = path.join(__dirname, 'temp', 'allHtml.json');
			axe(options, function () {
				assert(fileExists(expected), true);
				done();
			});
		});
	});

	describe('using CSS selector', function () {
		it('should use add a CSS selector to the list of elements to include in analysis', function (done) {
			const options = {
				urls: [fixtures('broken.html')],
				include: 'img'
			};
			axe(options, function () {
				assert.notEqual(output.match(/Found 1 accessibility violations/gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
				done();
			});
		});

		it('should use add a CSS selector to the list of elements to exclude in analysis', function (done) {
			const options = {
				urls: [fixtures('broken.html')],
				exclude: '#no-label'
			};
			axe(options, function () {
				assert.notEqual(output.match(/Found 2 accessibility violations/gi), null);
				assert.notEqual(output.match(/(File to test|test\/fixtures\/broken.html)/gi), null);
				done();
			});
		});

	})

	describe('using showOnlyViolations option', function () {
		it('should only returns the violations', function (done) {
			const options = {
				urls: [fixtures('broken.html', 'working.html')],
				saveOutputIn: 'allHtml.json',
				showOnlyViolations: true,
				folderOutputReport: path.join(__dirname, 'temp')
			};
			const expected = path.join(__dirname, 'temp', 'allHtml.json');
			let results;
			axe(options, function () {
				results = JSON.parse(fs.readFileSync(expected, 'utf8'));
				assert.equal(results.length, 1);
				assert.equal(results[0].passes, null);
				assert.notEqual(results[0].violations, null);
				done();
			});
		});
	});

	describe('using verbose option', function () {
		it('should show information messages about the analysis', function (done) {
			const options = {
				urls: [fixtures('working.html')],
				verbose: true
			};
			axe(options, function () {
				assert.notEqual(output.match(/Preparing results/gi), null);
				assert.notEqual(output.match(/Start reading the urls/gi), null);
				assert.notEqual(output.match(/Analysis start for: /gi), null);
				assert.notEqual(output.match(/Analyisis finished for: /gi), null);
				done();
			});
		});
	});

	describe('using a11yCheckOptions', function () {
		it('should override the rules', function (done) {
			const options = {
				urls: [fixtures('broken.html')],
				a11yCheckOptions: {
					'rules': {
						'html-has-lang': { enabled: false }
					}
				}
			};
			axe(options, function () {
				assert.notEqual(output.match(/Found 2 accessibility violations/gi), null);
				assert.equal(output.match(/<html> element must have a lang attribute/gi), null);
				done();
			});
		});
	});

	describe('detect 404 errors', function() {
		it('should show a not valid url or resource', function (done) {
			const options = {
				urls: ['http://www.estaurlnoexiste.com/']
			};
			axe(options, function () {
				assert.notEqual(output.match(/File to test: http:\/\/www.estaurlnoexiste.com\//gi), null);
				assert.notEqual(output.match(/URL not valid for analysis/gi), null);
				done();
			});
		});
	})

});
