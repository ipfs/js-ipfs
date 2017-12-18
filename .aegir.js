'use strict'

const parallel = require('async/parallel')
const ads = require('./test/utils/another-daemon-spawner')
const js = ads.spawnJsNode
const stop = ads.stopNodes

/*
 * spawns a daemon with ports numbers starting in 10 and ending in `num`
 */
function start (done) {
  const base = '/ip4/127.0.0.1/tcp'
  if (!process.env.IPFS_TEST) {
    parallel([
      (cb) => js([`${base}/10007`, `${base}/20007/ws`], true, 31007, 32007, cb),
      (cb) => js([`${base}/10008`, `${base}/20008/ws`], true, 31008, 32008, cb),
      (cb) => js([`${base}/10012`, `${base}/20012/ws`], true, 31012, 32012, cb),
      (cb) => js([`${base}/10013`, `${base}/20013/ws`], true, 31013, 32013, cb),
      (cb) => js([`${base}/10014`, `${base}/20014/ws`], true, 31014, 32014, cb),
      (cb) => js([`${base}/10015`, `${base}/20015/ws`], true, 31015, 32015, cb)
    ], done)
  } else if (process.env.IPFS_TEST === 'bootstrapers') {
    done()
  }
}

module.exports = {
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false,
      singleRun: false
    }]
  },
  hooks: {
    pre: start,
    post: stop
  }
}
