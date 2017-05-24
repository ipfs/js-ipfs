'use strict'

const gulp = require('gulp')
const parallel = require('async/parallel')
const series = require('async/series')
const createTempRepo = require('./test/utils/create-repo-node.js')
const HTTPAPI = require('./src/http-api')
const leftPad = require('left-pad')

let nodes = []

/*
 * spawns a daemon with ports numbers starting in 10 and ending in `num`
 */
function spawnDaemon (num, callback) {
  num = leftPad(num, 3, 0)

  const config = {
    Addresses: {
      Swarm: [
        `/ip4/127.0.0.1/tcp/10${num}`,
        `/ip4/127.0.0.1/tcp/20${num}/ws`
      ],
      API: `/ip4/127.0.0.1/tcp/31${num}`,
      Gateway: `/ip4/127.0.0.1/tcp/32${num}`
    },
    Bootstrap: [],
    Discovery: {
      MDNS: {
        Enabled: false
      },
      webRTCStar: {
        Enabled: false
      }
    }
  }

  const daemon = new HTTPAPI(createTempRepo(), config)
  nodes.push(daemon)
  daemon.start(true, callback)
}

gulp.task('libnode:start', (done) => {
  nodes = []
  parallel([
    (cb) => spawnDaemon(7, cb),
    (cb) => spawnDaemon(8, cb),
    (cb) => spawnDaemon(12, cb),
    (cb) => spawnDaemon(13, cb)
  ], done)
})

gulp.task('libnode:stop', (done) => {
  series(nodes.map((node) => (cb) => {
    setTimeout(() => node.stop(cb), 100)
  }), done)
})

gulp.task('test:browser:before', ['libnode:start'])
gulp.task('test:node:before', ['libnode:start'])
gulp.task('test:browser:after', ['libnode:stop'])
gulp.task('test:node:after', ['libnode:stop'])

require('aegir/gulp')(gulp)
