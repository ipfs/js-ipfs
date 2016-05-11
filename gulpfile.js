'use strict'

const gulp = require('gulp')
const parallel = require('run-parallel')
const series = require('run-series')
const createTempNode = require('./test/utils/temp-node')
const API = require('./src/http-api')

const nodes = []

function startNode (num, done) {
  createTempNode(num, (err, node) => {
    if (err) throw err

    const api = new API(node.repo.path())
    nodes.push(api)
    api.start(done)
  })
}

gulp.task('libnode:start', (done) => {
  parallel([
    (cb) => startNode(7, cb),
    (cb) => startNode(8, cb),
    (cb) => startNode(9, cb)
  ], done)
})

gulp.task('libnode:stop', (done) => {
  series(nodes.map((node) => (cb) => {
    setTimeout(() => node.stop(cb), 500)
  }), done)
})

gulp.task('test:browser:before', ['libnode:start'])
gulp.task('test:node:before', ['libnode:start'])
gulp.task('test:browser:after', ['libnode:stop'])
gulp.task('test:node:after', ['libnode:stop'])

require('aegir/gulp')(gulp)
