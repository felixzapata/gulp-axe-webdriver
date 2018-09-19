# gulp-axe-webdriver

[![Package Quality](http://npm.packagequality.com/badge/gulp-axe-webdriver.png)](http://npm.packagequality.com/badge/gulp-axe-webdriver.png)

> Gulp plugin for [aXe](https://github.com/dequelabs/axe-core) utilizing WebDriverJS.

Inspired by [grunt-axe-webdriver](https://github.com/dequelabs/grunt-axe-webdriver) and [gulp-axe-core](https://github.com/felixzapata/gulp-axe-core).

This plugin checks local and remote urls, using the Chrome browser via `chromedriver`.

## Install

```
$ npm install --save-dev gulp-axe-webdriver
```

## The task

### Usage

```js
var gulp = require('gulp');
var axe = require('gulp-axe-webdriver');

gulp.task('axe', function() {
  var options = {
    saveOutputIn: 'allHtml.json',
    urls: ['http://www.foobar-url-1/', 'http://www.foobar-url-2/']
  };
  return axe(options);
});
```

```js
var gulp = require('gulp');
var axe = require('gulp-axe-webdriver');

gulp.task('axe', function() {
  var options = {
    saveOutputIn: 'allHtml.json',
    urls: ['src/file2.html']
  };
  return axe(options);	
});
```

#### With Headless Chrome 

```js
var gulp = require('gulp');
var axe = require('gulp-axe-webdriver');

gulp.task('axe', function() {
  var options = {
    saveOutputIn: 'allHtml.json',
    headless: true,
    urls: ['src/file2.html']
  };
  return axe(options);	
});
```

#### With Glob patterns

```js
var gulp = require('gulp');
var axe = require('gulp-axe-webdriver');

gulp.task('axe', function() {
  var options = {
    saveOutputIn: 'allHtml.json',
    urls: ['src/*.html', 'http://www.foobar-url-2/']
  };
  return axe(options);
});
```

### Options
Type: `Object`

Default value:
```js
{
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
}
```

#### a11yCheckOptions
Type: `Object`

Specifies options to be used by axe.a11yCheck. Will override any other configured options. See [axe-core API documentation](https://github.com/dequelabs/axe-core/blob/master/doc/API.md) for information on its structure.

#### errorOnViolation
Type: `Boolean`

Default value: `false`

It throws an error on violation from aXe,  useful for CI environments if you want to break the build if any new violations are in your results.

#### exclude
Type: `String`

Default value: `null`

Add a CSS selector to the list of elements to exclude from analysis.

#### folderOutputReport
Type: `String`

Default value: `aXeReports`

An optional folder to indicate where the output will be saved.

#### headless
Type: `Boolean`

Default value: `false`

To run the Chrome browser in Headless mode.

#### include
Type: `String`

Default value: `null`

Adds a CSS selector to the list of elements to include in analysis.

#### saveOutputIn
Type: `String`

Default value: ''

An optional file to which the results of the accessibility scans will be written as a JSON Array of results objects.

#### scriptTimeout
Type: `Number`

Default value: `60000`

Number of milliseconds for WebDriver to wait before timing out an injected script.

#### showOnlyViolations
Type: `Boolean`

Default value: `false`

Returns only the results with the accessibility issues.

#### tags
Type: `String` or `Array[String]`

Default value: `null`

Which tags to filter violations on.

#### threshold
Type: `Number`

Default value: `0`

A number that represents the maximum number of allowable violations. Each violation represents a rule that fails, it may fail for an number of nodes. It is recommended that this value not be changed.
A negative value will prevent failure whatever the number of violations.

#### urls
Type: `Array[String]`

Default value: `[]`

An Array of URLs that will be tested. The default value is an empty array, you must supply at least one URL in order to successfully complete this task.

Can also be a glob pattern;

#### verbose
Type: `Boolean`

Default value: `false`

Show status of the analysis.

## Release History

Read the [full changelog](CHANGELOG.md).

## License

MIT © [Felix Zapata](http://github.com/felixzapata)
