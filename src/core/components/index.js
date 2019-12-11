'use strict'

exports.add = require('./add')
exports.config = require('./config')
exports.id = require('./id')
exports.init = require('./init')
exports.start = require('./start')
exports.stop = require('./stop')

exports.legacy = { // TODO: these will be removed as the new API is completed
  dag: require('./dag'),
  libp2p: require('./libp2p'),
  object: require('./object'),
  pin: require('./pin')
}
