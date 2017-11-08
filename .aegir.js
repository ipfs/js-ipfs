'use strict'

const parallel = require('async/parallel')
const spawnTools = require('./test/utils/spawn-tools')
const js = spawnTools.spawnJsNode
// const go = spawnTools.spawnGoNode
const stop = spawnTools.stopNodes

/*
 * spawns a daemon with ports numbers starting in 10 and ending in `num`
 */
function pre (done) {
  const base = '/ip4/127.0.0.1/tcp'

  parallel([
    (cb) => js([`${base}/10007`, `${base}/20007/ws`], true, 31007, 32007, cb),
    (cb) => js([`${base}/10008`, `${base}/20008/ws`], true, 31008, 32008, cb),
    (cb) => js([`${base}/10012`, `${base}/20012/ws`], true, 31012, 32012, cb),
    (cb) => js([`${base}/10013`, `${base}/20013/ws`], true, 31013, 32013, cb),
    (cb) => js([`${base}/10014`, `${base}/20014/ws`], true, 31014, 32014, cb),
    (cb) => js([`${base}/10015`, `${base}/20015/ws`], true, 31015, 32015, cb)
    // (cb) => go([`${base}/10027`, `${base}/20027/ws`], true, 33027, 44027, cb),
    // (cb) => go([`${base}/10028`, `${base}/20028/ws`], true, 33028, 44028, cb),
    // (cb) => go([`${base}/10031`, `${base}/20031/ws`], true, 33031, 44031, cb),
    // (cb) => go([`${base}/10032`, `${base}/20032/ws`], true, 33032, 44032, cb)
  ], done)
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
    pre: pre,
    post: stop
  }
}
