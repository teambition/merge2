'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  gulpSequence = require('gulp-sequence'),
  gulpMerge = require('./index'),
  test = require('./test/index');

gulp.task('jshint', function () {
  return gulp.src(['*.js', 'test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

test();

gulp.task('default', gulpSequence('jshint', 'test'));
