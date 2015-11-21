'use strict'

const gulp = require('gulp')
const Server = require('karma').Server
const $ = require('gulp-load-plugins')()
const runSequence = require('run-sequence')

require('./daemons')

gulp.task('test', done => {
  runSequence(
    'test:node',
    'test:browser',
    done
  )
})

gulp.task('test:node', done => {
  runSequence(
    'daemons:start',
    'mocha',
    'daemons:stop',
    done
  )
})

gulp.task('test:browser', done => {
  runSequence(
    'daemons:start',
    'karma',
    'daemons:stop',
    done
  )
})

gulp.task('mocha', () => {
  return gulp.src([
    'test/setup.js',
    'test/**/*.spec.js'
  ])
    .pipe($.mocha())
})

gulp.task('karma', done => {
  new Server({
    configFile: __dirname + '/../karma.conf.js',
    singleRun: true
  }, done).start()
})
