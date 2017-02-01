'use strict'

const gulp = require('gulp')
const parallel = require('async/parallel')
const series = require('async/series')
// const IPFSFactory = require('./test/utils/ipfs-factory-daemon')
const createTempRepo = require('./test/utils/create-repo-node.js')
const IPFS = require('./src/core')
const HTTPAPI = require('./src/http-api')
const leftPad = require('left-pad')

let nodes = []

function setAddresses (repo, num, callback) {
  repo.config.get((err, config) => {
    if (err) {
      return callback(err)
    }

    config.Addresses = {
      Swarm: [
        `/ip4/127.0.0.1/tcp/10${num}`,
        `/ip4/127.0.0.1/tcp/20${num}/ws`
      ],
      API: `/ip4/127.0.0.1/tcp/31${num}`,
      Gateway: `/ip4/127.0.0.1/tcp/32${num}`
    }

    config.Discovery.MDNS.Enabled = false

    repo.config.set(config, callback)
  })
}

function createTempNode (num, callback) {
  const repo = createTempRepo()
  const ipfs = new IPFS({
    repo: repo,
    EXPERIMENTAL: {
      pubsub: true
    }
  })

  num = leftPad(num, 3, 0)

  series([
    (cb) => ipfs.init({
      emptyRepo: true,
      bits: 1024
    }, cb),
    (cb) => setAddresses(repo, num, cb),
    (cb) => ipfs.load(cb)
  ], (err) => {
    if (err) {
      return callback(err)
    }
    callback(null, ipfs)
  })
}

function startNode (num, done) {
  createTempNode(num, (err, node) => {
    if (err) {
      return done(err)
    }

    const daemon = new HTTPAPI(node.repo.path())
    nodes.push(daemon)
    daemon.start(done)
  })
}

gulp.task('libnode:start', (done) => {
  nodes = []
  parallel([
    (cb) => startNode(7, cb),
    (cb) => startNode(8, cb),
    (cb) => startNode(12, cb),
    (cb) => startNode(13, cb)
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
