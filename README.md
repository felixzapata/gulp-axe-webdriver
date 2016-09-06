# gulp-axe-webdriver

[![Package Quality](http://npm.packagequality.com/badge/gulp-axe-webdriver.png)](http://npm.packagequality.com/badge/gulp-axe-webdriver.png)

> Gulp plugin for [aXe](https://github.com/dequelabs/axe-core) utilizing WebDriverJS and PhantomJS.

Inspired by [grunt-axe-webdriver](https://github.com/dequelabs/grunt-axe-webdriver) and [gulp-axe-core](https://github.com/felixzapata/gulp-axe-core).

It uses **PhantomJS** to open the remote urls. This plugin is very similar to [gulp-axe-core](https://github.com/felixzapata/gulp-axe-core). 

**Sooner or later, it is possible both plugins will be merge in one which will have the capabilities to test local and remote urls at the same time.**.

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

### Options
Type: `Object`
Default value:
```
{
  threshold: 0,
	folderOutputReport: 'aXeReports',
	saveOutputIn: ''
}
```

### threshold
Type: `Number`
Default value: `0`

A number that represents the maximum number of allowable violations. Each violation represents a rule that fails, it may fail for an number of nodes. It is recommended that this value not be changed.
A negative value will prevent failure whatever the number of violations.


### saveOutputIn
Type: `String`
Default value: ''

An optional file to which the results of the accessibility scans will be written as a JSON Array of results objects.

### folderOutputReport
Type: `String`
Default value: 'aXeReports'

An optional folder to indicate where the output will be saved.

## License

MIT © [Felix Zapata](http://github.com/felixzapata)
