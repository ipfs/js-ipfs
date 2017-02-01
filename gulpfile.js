'use strict'

const gulp = require('gulp')
const parallel = require('async/parallel')
const series = require('async/series')
const createTempRepo = require('./test/utils/create-repo-node.js')
const IPFS = require('./src/core')
const HTTPAPI = require('./src/http-api')
const leftPad = require('left-pad')

let nodes = []

/*
 * spawns a daemon with ports numbers starting in 10 and ending in `num`
 */
function spawnDaemon (num, callback) {
  num = leftPad(num, 3, 0)

  const repo = createTempRepo()

  const node = new IPFS({
    repo: repo,
    EXPERIMENTAL: {
      pubsub: true
    }
  })

  series([
    (cb) => node.init({ emptyRepo: true, bits: 1024 }, cb),
    (cb) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }

        config.Addresses = {
          Swarm: [
            `/ip4/127.0.0.1/tcp/10${num}`,
            `/ip4/127.0.0.1/tcp/20${num}/ws`
          ],
          API: `/ip4/127.0.0.1/tcp/31${num}`,
          Gateway: `/ip4/127.0.0.1/tcp/32${num}`
        }

        config.Discovery.MDNS.Enabled = false

        repo.config.set(config, cb)
      })
    },
    (cb) => node.load(cb),
    (cb) => {
      const daemon = new HTTPAPI(node.repo.path())
      nodes.push(daemon)
      daemon.start(cb)
    }
  ], callback)
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
    setTimeout(() => node.stop(cb), 200)
  }), done)
})

gulp.task('test:browser:before', ['libnode:start'])
gulp.task('test:node:before', ['libnode:start'])
gulp.task('test:browser:after', ['libnode:stop'])
gulp.task('test:node:after', ['libnode:stop'])

require('aegir/gulp')(gulp)
