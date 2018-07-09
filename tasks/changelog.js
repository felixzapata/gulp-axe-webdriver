'use strict';
const gulp = require('gulp');
const conventionalChangelog = require('conventional-changelog');
const fs = require('fs');
const file = 'CHANGELOG.md';

gulp.task('changelog', function (done) {

  fs.readFile('./package.json', 'utf8', function () {
    const buffer = [];
    const stream = conventionalChangelog({
      preset: 'angular',
      host: 'github',
    }, { linkReferences: true });

    stream.on('end', function () {
      const contentToWrite = Buffer.concat(buffer);

      if (fs.existsSync(file)) {
        const oldChangelog = fs.readFileSync(file);
        const fd = fs.openSync(file, 'w+');
        fs.writeSync(fd, contentToWrite, 0, contentToWrite.length);
        fs.writeSync(fd, oldChangelog, 0, oldChangelog.length);
        fs.close(fd);
      } else {
        fs.writeFileSync(file, contentToWrite);
      }
      done();
    });

    stream.on('data', function (data) {
      buffer.push(data);
    });
  });
});
