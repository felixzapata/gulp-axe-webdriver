'use strict';
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const log = require('fancy-log');

function doBump(type) {
  return function () {
    return gulp.src('./package.json')
      .pipe($.bump(type).on('error', log))
      .pipe(gulp.dest('./'));
  };
}

gulp.task('bump:major', doBump({
  type: 'major'
}));

gulp.task('bump:minor', doBump({
  type: 'minor'
}));

gulp.task('bump:patch', doBump({
  type: 'patch'
}));
