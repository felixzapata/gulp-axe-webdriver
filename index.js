'use strict';
var path = require('path');
var fs = require('fs-path');
var AxeBuilder = require('axe-webdriverjs');
var WebDriver = require('selenium-webdriver');
var Promise = require('promise');
var reporter = require('./lib/reporter');

//setup custom phantomJS capability
var phantomjs_exe = require('phantomjs-prebuilt').path;
var customPhantom = WebDriver.Capabilities.phantomjs().set('phantomjs.binary.path', phantomjs_exe);

var promise;
var results = [];

module.exports = function (customOptions, done) {

	var defaultOptions = {
		folderOutputReport: 'aXeReports',
		saveOutputIn: '',
		threshold: 0
	};

	var options = customOptions ? Object.assign(defaultOptions, customOptions) : defaultOptions;

	var driver = new WebDriver.Builder().withCapabilities(customPhantom).build();

	var createResults = function(results) {

		var dest = '';
		if(options.saveOutputIn !== '') {
			dest = path.join(options.folderOutputReport, options.saveOutputIn);
			fs.writeFileSync(dest, JSON.stringify(results, null, '  '));
		}
		reporter(results, options.threshold);
		driver.quit().then(function() {
				done();
		});

	};

	Promise.all(options.urls.map(function(url) {
			return new Promise(function(resolve, reject) {
				driver
					.get(url)
					.then(function() {
						var startTimestamp = new Date().getTime();
						var axeBuilder = new AxeBuilder(driver);
						axeBuilder.analyze(function(results) {
							results.url = url;
							results.timestamp = new Date().getTime();
							results.time = results.timestamp - startTimestamp;
							resolve(results);
						});
					});
			});
		})).then(createResults);

};
