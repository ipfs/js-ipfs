'use strict'

const gulp = require('gulp')
const factoryServer = require('./server')

let factory

gulp.task('factory:start', (done) => {
  factoryServer((err, http) => {
    if (err) {
      throw err
    }
    factory = http
    done()
  })
})

gulp.task('factory:stop', (done) => {
  factory.stop(done)
})
