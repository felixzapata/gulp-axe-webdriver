'use strict';
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const AxeBuilder = require('axe-webdriverjs');
const WebDriver = require('selenium-webdriver');
const Promise = require('promise');
const fileUrl = require('file-url');
const reporter = require('./lib/reporter');
const chalk = require('chalk');
const request = require('then-request');
require('chromedriver');

function flatten(arr) {
	return [].concat.apply([], arr);
}

function isRemoteUrl(url) {
	return url.indexOf('http://') >= 0 || url.indexOf('https://') >= 0;
}

function getUrl(url) {
	return isRemoteUrl(url) ? url : fileUrl(url);
}

function checkNotValidUrls(result) {
	return new Promise(function (resolve) {
		request('GET', result.url).then((res) => {
			result.status = res.statusCode;
			resolve(result);
		}).catch(() => {
			result.status = 404;
			resolve(result);
		});
	});
}

function getRemoteUrls(result) {
	if (isRemoteUrl(result.url)) {
		return result;
	}
}

function getLocalUrls(result) {
	if (!isRemoteUrl(result.url)) {
		return result;
	}
}

function onlyViolations(item) {
	return item.violations.length > 0;
}

function removePassesValues(item) {
	delete item.passes;
	return item;
}

function mergeArray(coll, item) {
	coll.push(item);
	return coll;
}

function findGlobPatterns(urls) {
	return urls.map((url) => {
		return isRemoteUrl(url) ? url : glob.sync(url);
	});
}

module.exports = function aXe(customOptions, done) {
	const defaultOptions = {
		folderOutputReport: 'aXeReports',
		showOnlyViolations: false,
		verbose: false,
		headless: false,
		saveOutputIn: '',
		tags: null,
		urls: [],
		threshold: 0
	};

	const options = customOptions ? Object.assign(defaultOptions, customOptions) : defaultOptions;
	const chromeCapabilities = WebDriver.Capabilities.chrome();
	const chromeOptions = options.headless ? { 'args': ['--headless'] } : {};
	chromeCapabilities.set('chromeOptions', chromeOptions);
	const driver = new WebDriver.Builder().withCapabilities(chromeCapabilities).build();

	try {
		driver.manage();
		// browser is open
	} catch(NoSuchSessionError) {
		// browser is closed
		driver.manage().timeouts().setScriptTimeout(60000);
	}

	const tagsAreDefined = (!Array.isArray(options.tags) && options.tags !== null && options.tags !== '') ||
		(Array.isArray(options.tags) && options.tags.length > 0);

	const urls = flatten(findGlobPatterns(options.urls));

	if (options.verbose) {
		console.log(chalk.yellow('Start reading the urls'));
		console.log(chalk.yellow('======================'));
	}

	Promise.all(urls.map(function (url) {
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

					axeBuilder.analyze(function (results) {
						results.url = url;
						results.timestamp = new Date().getTime();
						results.time = results.timestamp - startTimestamp;
						if (options.verbose) {
							console.log(chalk.cyan('Analyisis finished for: ') + url);
						}
						resolve(results);
					});
				});
		});
	})).then(function (results) {
		let dest = '';
		const localUrls = results.filter(getLocalUrls);
		const remoteUrls = results.filter(getRemoteUrls);
		const promises = remoteUrls.map(checkNotValidUrls);
		let resultsForReporter;

		return Promise.all(promises).then(function (results) {
			resultsForReporter = localUrls.reduce(mergeArray, results);
			if (options.showOnlyViolations) {
				resultsForReporter = resultsForReporter.map(removePassesValues).filter(onlyViolations);
			}
			if (options.saveOutputIn !== '') {
				dest = path.join(options.folderOutputReport, options.saveOutputIn);
				try {
					fs.outputFileSync(dest, JSON.stringify(resultsForReporter, null, '  '));
				} catch (error) {
					console.log(error);
				}
			}
			if (options.verbose) {
				console.log(chalk.yellow('Preparing results'));
				console.log(chalk.yellow('================='));
			}
			reporter(resultsForReporter, options.threshold);
			driver.quit().then(done);
		});
	});
};
