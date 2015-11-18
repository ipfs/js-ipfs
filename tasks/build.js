const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const webpack = require('webpack-stream')
const rimraf = require('rimraf')
const runSequence = require('run-sequence')

const config = require('./config')

gulp.task('clean', function (done) {
  rimraf('./dist', done)
})

gulp.task('build:nonminified', function () {
  return gulp.src('src/index.js')
    .pipe(webpack(config.webpack.dev))
    .pipe($.size())
    .pipe(gulp.dest('dist/'))
})

gulp.task('build:minified', function () {
  config.webpack.prod.output.filename = 'ipfsapi.min.js'

  return gulp.src('src/index.js')
    .pipe(webpack(config.webpack.prod))
    .pipe($.size())
    .pipe(gulp.dest('dist/'))
})

gulp.task('build', ['clean'], function (done) {
  runSequence(
    'build:nonminified',
    'build:minified',
    done
  )
})
