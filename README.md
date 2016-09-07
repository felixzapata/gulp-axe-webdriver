# gulp-axe-webdriver

[![Package Quality](http://npm.packagequality.com/badge/gulp-axe-webdriver.png)](http://npm.packagequality.com/badge/gulp-axe-webdriver.png)

> Gulp plugin for [aXe](https://github.com/dequelabs/axe-core) utilizing WebDriverJS.

Inspired by [grunt-axe-webdriver](https://github.com/dequelabs/grunt-axe-webdriver) and [gulp-axe-core](https://github.com/felixzapata/gulp-axe-core).

This plugin checks local and remote urls.

## Install

```
$ npm install --save-dev gulp-axe-webdriver
```

## The task

### Usage

```js
var gulp = require('gulp');
var axeCore = require('gulp-axe-webdriver');

gulp.task('axe', function(done) {
  var options = {
			saveOutputIn: 'allHtml.json',
      urls: ['http://www.foobar-url-1/', 'http://www.foobar-url-2/']
	};
	return axeCore(options, done);
});

```

#### With Chrome (default)

```js
var gulp = require('gulp');
var axeCore = require('gulp-axe-core');

gulp.task('axe', function(done) {
  var options = {
			saveOutputIn: 'allHtml.json',
			files: ['src/file2.html']
	};

	return axeCore(options, done);
	
});

```

#### With PhantomJS

```js
var gulp = require('gulp');
var axeCore = require('gulp-axe-core');

gulp.task('axe', function() {
  var options = {
			saveOutputIn: 'allHtml.json',
			browser: 'phantomjs',
			files: ['src/file2.html']
	};
	return axeCore(options, done);
});

```

#### With Glob patterns

```js
var gulp = require('gulp');
var axeCore = require('gulp-axe-core');

gulp.task('axe', function() {
  var options = {
			saveOutputIn: 'allHtml.json',
			browser: 'phantomjs',
			files: ['src/*.html', 'http://www.foobar-url-2/']
	};
	return axeCore(options, done);
});

```

### Options
Type: `Object`
Default value:
```
{
  threshold: 0,
	browser: 'chrome',
	folderOutputReport: 'aXeReports',
	saveOutputIn: '',
	tags: null
}
```

#### threshold
Type: `Number`
Default value: `0`

A number that represents the maximum number of allowable violations. Each violation represents a rule that fails, it may fail for an number of nodes. It is recommended that this value not be changed.
A negative value will prevent failure whatever the number of violations.

#### browser
Type: `String`
Default value: `chrome`

Which browser to run the tests in.

### urls
Type: `String` or `Array[String]`
Default value: `[]`

An Array of URLs that will be tested. The default value is an empty array, you must supply at least one URL in order to successfully complete this task.

Can also be a glob pattern;

#### tags
Type: `String` or `Array[String]`
Default value: `null`

Which tags to filter violations on

#### saveOutputIn
Type: `String`
Default value: ''

An optional file to which the results of the accessibility scans will be written as a JSON Array of results objects.

#### folderOutputReport
Type: `String`
Default value: 'aXeReports'

An optional folder to indicate where the output will be saved.

## License

MIT © [Felix Zapata](http://github.com/felixzapata)
