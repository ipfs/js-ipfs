'use strict'

exports.add = require('./add')
exports.block = {
  get: require('./block/get'),
  put: require('./block/put'),
  rm: require('./block/rm'),
  stat: require('./block/stat')
}
exports.config = require('./config')
exports.init = require('./init')
exports.pin = {
  add: require('./pin/add'),
  ls: require('./pin/ls'),
  rm: require('./pin/rm')
}
exports.start = require('./start')
exports.stop = require('./stop')

exports.legacy = { // TODO: these will be removed as the new API is completed
  dag: require('./dag'),
  libp2p: require('./libp2p'),
  object: require('./object')
}
