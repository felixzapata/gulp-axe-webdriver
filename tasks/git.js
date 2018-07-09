'use strict';
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const fs = require('fs');
const chalk = require('chalk');
const log = require('fancy-log');

function getPackageJSONVersion() {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
}

gulp.task('commit-changes', function () {
  const version = getPackageJSONVersion();
  return gulp.src('./package.json')
    .pipe($.git.add())
    .pipe($.git.commit('chore(package.json): bump version ' + version));
});

gulp.task('commit-changelog', function () {
  const version = getPackageJSONVersion();
  return gulp.src('CHANGELOG.md')
    .pipe($.git.add())
    .pipe($.git.commit('docs(CHANGELOG.md): update CHANGELOG.md with version ' + version));
});

gulp.task('create-new-tag', function () {
  const version = getPackageJSONVersion();
  return $.git.tag(version, 'New version ' + version, function (error) {
    if (error) {
      log(chalk.red(error));
    }
  });
});

gulp.task('git', gulp.series('commit-changelog', 'commit-changes', 'create-new-tag'));
