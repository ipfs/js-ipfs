'use strict'

const parallel = require('async/parallel')
const series = require('async/series')
const createTempRepo = require('./test/utils/create-repo-nodejs.js')
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

module.exports = {
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }]
  },
  hooks: {
    pre (callback) {
      nodes = []
      parallel([
        (cb) => spawnDaemon(7, cb),
        (cb) => spawnDaemon(8, cb),
        (cb) => spawnDaemon(12, cb),
        (cb) => spawnDaemon(13, cb)
      ], callback)
    },
    post (callback) {
      series(nodes.map((node) => (cb) => {
        setTimeout(() => node.stop(cb), 100)
      }), callback)
    }
  }
}
