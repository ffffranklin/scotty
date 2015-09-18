'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');
var eslint = require('gulp-eslint');

gulp.task('test', shell.task([
  'tape "test/**/*.test.js" | faucet'
]));

gulp.task('cover', shell.task([
  'istanbul cover tape -- "test/**/*.test.js"'
]));

gulp.task('codeclimate', ['cover'], shell.task([
  'codeclimate-test-reporter < coverage/lcov.info'
]));

gulp.task('lint', function () {
  return gulp.src(['index.js', 'config.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('watch', ['test', 'lint'], function() {
  var paths= [
    '**/*.js',
    'test/**/*.js'
  ];
  gulp.watch(paths, ['test']);
  gulp.watch(paths, ['lint']);
});

gulp.task('default', ['test']);
