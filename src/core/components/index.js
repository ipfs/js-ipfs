'use strict'

exports.add = require('./add')
exports.block = {
  get: require('./block/get'),
  put: require('./block/put'),
  rm: require('./block/rm'),
  stat: require('./block/stat')
}
exports.config = require('./config')
exports.dag = {
  get: require('./dag/get'),
  put: require('./dag/put'),
  resolve: require('./dag/resolve'),
  tree: require('./dag/tree')
}
exports.init = require('./init')
exports.pin = {
  add: require('./pin/add'),
  ls: require('./pin/ls'),
  rm: require('./pin/rm')
}
exports.start = require('./start')
exports.stop = require('./stop')

exports.legacy = { // TODO: these will be removed as the new API is completed
  libp2p: require('./libp2p'),
  object: require('./object')
}
