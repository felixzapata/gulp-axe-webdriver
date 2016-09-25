'use strict';
var path = require('path');
var fs = require('fs-path');
var glob = require('glob');
var AxeBuilder = require('axe-webdriverjs');
var WebDriver = require('selenium-webdriver');
var Promise = require('promise');
var fileUrl = require('file-url');
var reporter = require('./lib/reporter');
require('chromedriver');

//setup custom phantomJS capability
var phantomjs_exe = require('phantomjs-prebuilt').path;
var customPhantom = WebDriver.Capabilities.phantomjs().set('phantomjs.binary.path', phantomjs_exe);

module.exports = function (customOptions, done) {

	var defaultOptions = {
		folderOutputReport: 'aXeReports',
		browser: 'chrome',
		saveOutputIn: '',
		tags: null,
		urls: [],
		threshold: 0
	};

	var options = customOptions ? Object.assign(defaultOptions, customOptions) : defaultOptions;
	var driver = options.browser === 'phantomjs' ? new WebDriver.Builder().withCapabilities(customPhantom).build() : new WebDriver.Builder().forBrowser(options.browser).build();
	var tagsAreDefined = (!Array.isArray(options.tags) && options.tags !== null && options.tags !== '') || (Array.isArray(options.tags) && options.tags.length > 0);

	var isRemoteUrl = function(url) {
		return url.indexOf('http://') >= 0 || url.indexOf('https://') >= 0;
	};

	var flatten = function(arr) {
		return [].concat.apply([], arr);
	};

	var getUrl = function(url) {
		return isRemoteUrl(url) ? url : fileUrl(url);
	}

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

	var findGlobPatterns = function(urls) {
		return urls.map(function(url) {
			return isRemoteUrl(url) ? url : glob.sync(url);
		});
	};

	var urls = flatten(findGlobPatterns(options.urls));

	Promise.all(urls.map(function(url) { 
			return new Promise(function(resolve) {
				driver
					.get(getUrl(url))
					.then(function() {
						var startTimestamp = new Date().getTime();
						var axeBuilder = new AxeBuilder(driver);

						if(options.include) {
							axeBuilder.include(options.include);
						}

						if(options.exclude) {
							axeBuilder.exclude(options.exclude);
						}

						if (tagsAreDefined) {
							axeBuilder.withTags(options.tags);
						}

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
