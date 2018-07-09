'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('test', gulp.series('lint', function () {
    return gulp.src('test.js', {cwd: './test', read: false})
        .pipe($.mocha());
}));
