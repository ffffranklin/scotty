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

gulp.task('codeclimate', gulp.series('cover', shell.task([
  'codeclimate-test-reporter < coverage/lcov.info'
])));

gulp.task('lint', function () {
  return gulp.src(['index.js', 'config.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('watch', gulp.series('test', 'lint', function() {
  var paths = [
    '**/*.js',
    'test/**/*.js'
  ];
  gulp.watch(paths, ['test']);
  gulp.watch(paths, ['lint']);
}));

gulp.task('default', gulp.series('test'));
