'use strict'

exports.add = require('./add')
exports.bitswap = {
  stat: require('./bitswap/stat'),
  unwant: require('./bitswap/unwant'),
  wantlist: require('./bitswap/wantlist')
}
exports.config = require('./config')
exports.id = require('./id')
exports.init = require('./init')
exports.object = require('./object')
exports.ping = require('./ping')
exports.start = require('./start')
exports.stop = require('./stop')
exports.version = require('./version')

exports.legacy = { // TODO: these will be removed as the new API is completed
  dag: require('./dag'),
  libp2p: require('./libp2p'),
  pin: require('./pin')
}
