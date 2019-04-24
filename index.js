'use strict';
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var AxeBuilder = require('axe-webdriverjs');
var WebDriver = require('selenium-webdriver');
var Promise = require('promise');
var fileUrl = require('file-url');
var reporter = require('./lib/reporter');
var chalk = require('chalk');
var request = require('then-request');
var PluginError = require('plugin-error');
require('chromedriver');

module.exports = function (customOptions) {

	var defaultOptions = {
		errorOnViolation: false,
		folderOutputReport: 'aXeReports',
		headless: false,
		saveOutputIn: '',
		scriptTimeout: 60000,
		showOnlyViolations: false,
		tags: null,
		threshold: 0,
		urls: [],
		verbose: false
	};

	var violationsCount = 0;
	var options = customOptions ? Object.assign(defaultOptions, customOptions) : defaultOptions;
	var chromeCapabilities = WebDriver.Capabilities.chrome();
	var chromeOptions = options.headless ? { 'args': ['--headless'] } : {};
	chromeCapabilities.set('chromeOptions', chromeOptions);
	var driver = new WebDriver.Builder().withCapabilities(chromeCapabilities).build();
	if (typeof options.scriptTimeout === 'number') {
		driver.manage().timeouts().setScriptTimeout(options.scriptTimeout);
	}
	var tagsAreDefined = (!Array.isArray(options.tags) && options.tags !== null && options.tags !== '') ||
		(Array.isArray(options.tags) && options.tags.length > 0);

	var isRemoteUrl = function (url) {
		return url.indexOf('http://') >= 0 || url.indexOf('https://') >= 0;
	};

	var flatten = function (arr) {
		return [].concat.apply([], arr);
	};

	var getUrl = function (url) {
		return isRemoteUrl(url) ? url : fileUrl(url);
	}

	var checkNotValidUrls = function (result) {
		return new Promise(function (resolve) {
			request('GET', result.url, function (error) {
				result.status = (error) ? 404 : 200;
				resolve(result);
			});
		});
	}

	var getRemoteUrls = function (result) {
		if (isRemoteUrl(result.url)) {
			return result;
		}
	};

	var getLocalUrls = function (result) {
		if (!isRemoteUrl(result.url)) {
			return result;
		}
	};

	var onlyViolations = function (item) {
		return item.violations.length > 0;
	};

	var removePassesValues = function (item) {
		delete item.passes;
		return item;
	};

	var mergeArray = function (coll, item) {
		coll.push(item);
		return coll;
	};

	var createResults = function (results) {
		var dest = '';
		var localUrls = results.filter(getLocalUrls);
		var remoteUrls = results.filter(getRemoteUrls);
		var promises = remoteUrls.map(checkNotValidUrls);
		var resultsForReporter;
		return Promise.all(promises).then(function (results) {
			resultsForReporter = localUrls.reduce(mergeArray, results);
			if (options.showOnlyViolations) {
				resultsForReporter = resultsForReporter.map(removePassesValues).filter(onlyViolations);
			}
			if (options.saveOutputIn !== '') {
				dest = path.join(options.folderOutputReport, options.saveOutputIn);
				if(!fs.existsSync(options.folderOutputReport)) {
					fs.mkdirSync(options.folderOutputReport);
				}
				fs.writeFileSync(dest, JSON.stringify(resultsForReporter, null, '  '));
			}
			if (options.verbose) {
				console.log(chalk.yellow('Preparing results'));
				console.log(chalk.yellow('================='));
			}
			reporter(resultsForReporter, options.threshold);
			if (options.errorOnViolation && violationsCount > 0) {
				throw new PluginError(
					'gulp-axe-webdriver',
					'Encountered ' + violationsCount + ' axe violation errors'
				);
			}
			return driver.quit();
		});
	};

	var findGlobPatterns = function (urls) {
		return urls.map(function (url) {
			return isRemoteUrl(url) ? url : glob.sync(url);
		});
	};

	var urls = flatten(findGlobPatterns(options.urls));

	if (options.verbose) {
		console.log(chalk.yellow('Start reading the urls'));
		console.log(chalk.yellow('======================'));
	}
	return Promise.all(urls.map(function (url) {
		return new Promise(function (resolve) {
			driver
				.get(getUrl(url))
				.then(function () {
					if (options.verbose) {
						console.log(chalk.cyan('Analysis start for: ') + url);
					}
					var startTimestamp = new Date().getTime();
					var axeBuilder = new AxeBuilder(driver);

					if (options.include) {
						axeBuilder.include(options.include);
					}

					if (options.exclude) {
						axeBuilder.exclude(options.exclude);
					}

					if (tagsAreDefined) {
						axeBuilder.withTags(options.tags);
					}

					if (options.a11yCheckOptions) {
						axeBuilder.options(options.a11yCheckOptions);
					}

					return axeBuilder.analyze(function (err, results) {
						if (err) {
							console.log(err);
						}
						results.url = url;
						results.timestamp = new Date().getTime();
						results.time = results.timestamp - startTimestamp;
						if (results.violations.length > 0) {
							++violationsCount;
						}
						if (options.verbose) {
							console.log(chalk.cyan('Analysis finished for: ') + url);
						}
						resolve(results);
					});
				});
		});

	})).then(createResults);

};
