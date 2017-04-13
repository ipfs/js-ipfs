'use strict'

const parallel = require('async/parallel')

const spawnJsNode = require('./test/utils/spawn-tools').spawnJsNode
const spawnGoNode = require('./test/utils/spawn-tools').spawnGoNode
const stopNodes = require('./test/utils/spawn-tools').stopNodes

/*
 * spawns a daemon with ports numbers starting in 10 and ending in `num`
 */
const before = (done) => {
  parallel([
    (cb) => spawnJsNode([
      `/ip4/127.0.0.1/tcp/10007`,
      `/ip4/127.0.0.1/tcp/20007/ws`
    ], true, 31007, 32007, cb),
    (cb) => spawnJsNode([
      `/ip4/127.0.0.1/tcp/10008`,
      `/ip4/127.0.0.1/tcp/20008/ws`
    ], true, 31008, 32008, cb),
    (cb) => spawnJsNode([
      `/ip4/127.0.0.1/tcp/10012`,
      `/ip4/127.0.0.1/tcp/20012/ws`
    ], true, 31012, 32012, cb),
    (cb) => spawnJsNode([
      `/ip4/127.0.0.1/tcp/10013`,
      `/ip4/127.0.0.1/tcp/20013/ws`
    ], true, 31013, 32013, cb),
    (cb) => spawnJsNode([
      `/ip4/127.0.0.1/tcp/10014`,
      `/ip4/127.0.0.1/tcp/20014/ws`
    ], true, 31014, 32014, cb),
    (cb) => spawnJsNode([
      `/ip4/127.0.0.1/tcp/10015`,
      `/ip4/127.0.0.1/tcp/20015/ws`
    ], true, 31015, 32015, cb),
    (cb) => spawnGoNode([
      `/ip4/127.0.0.1/tcp/10027`,
      `/ip4/127.0.0.1/tcp/20027/ws`
    ], true, 33027, 44027, cb),
    (cb) => spawnGoNode([
      `/ip4/127.0.0.1/tcp/10028`,
      `/ip4/127.0.0.1/tcp/20028/ws`
    ], true, 33028, 44028, cb),
    (cb) => spawnGoNode([
      `/ip4/127.0.0.1/tcp/10031`,
      `/ip4/127.0.0.1/tcp/20031/ws`
    ], true, 33031, 44031, cb),
    (cb) => spawnGoNode([
      `/ip4/127.0.0.1/tcp/10032`,
      `/ip4/127.0.0.1/tcp/20032/ws`
    ], true, 33032, 44032, cb)
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
    pre: before,
    post: stopNodes
  }
}
