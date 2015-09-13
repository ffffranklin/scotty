'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('test', shell.task([
  'tape test/**/*.js | faucet',
]));

gulp.task('autotest', ['test'], function() {
  gulp.watch(['index.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['test']);
