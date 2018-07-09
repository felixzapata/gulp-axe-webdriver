'use strict';
var gulp = require('gulp');
const log = require('fancy-log');
const chalk = require('chalk');

function done(error) {
  if (error) {
    log(chalk.red(error.message));
  } else {
    log(chalk.green('Release finished successfully'));
  }
}

gulp.task('release:major', gulp.series('test', 'bump:major', 'changelog', 'git', done));

gulp.task('release:minor', gulp.series('test', 'bump:minor', 'changelog', 'git', done));

gulp.task('release:patch',  gulp.series('test', 'bump:patch', 'changelog', 'git', done));
