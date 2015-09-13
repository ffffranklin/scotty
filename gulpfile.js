'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');
var eslint = require('gulp-eslint');

gulp.task('test', shell.task([
  'tape test/**/*.js | faucet',
]));

gulp.task('lint', function () {
  return gulp.src(['index.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('watch', ['test', 'lint'], function() {
  gulp.watch(['index.js', 'test/**/*.js'], ['test']);
  gulp.watch(['index.js', 'test/**/*.js'], ['lint']);
});

gulp.task('default', ['test']);
