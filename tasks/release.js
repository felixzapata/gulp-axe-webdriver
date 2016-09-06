'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

function done(error) {
  if (error) {
    $.util.log($.util.colors.red(error.message));
  } else {
    $.util.log($.util.colors.green('Release finished successfully'));
  }

}

gulp.task('release:major', function (cb) {
  runSequence('bump:major', 'changelog', 'git', done);
});

gulp.task('release:minor', function (cb) {
  runSequence('bump:minor', 'changelog', 'git', done);
});

gulp.task('release:patch', function () {
  runSequence('bump:patch', 'changelog', 'git', done);
});