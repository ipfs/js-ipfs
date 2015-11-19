'use strict'

const gulp = require('gulp')
const $ = require('gulp-load-plugins')()

gulp.task('lint', () => {
  return gulp.src([
    '*.js',
    'test/**/*.js',
    'src/**/*.js',
    'tasks/**/*.js'
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
})
