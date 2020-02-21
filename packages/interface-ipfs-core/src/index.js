'use strict'

const { createSuite } = require('./utils/suite')

exports.root = createSuite({
  add: require('./add'),
  cat: require('./cat'),
  get: require('./get'),
  ls: require('./ls'),
  refs: require('./refs'),
  refsLocal: require('./refs-local')
})

exports.files = require('./files')

exports.bitswap = require('./bitswap')
exports.block = require('./block')

exports.dag = require('./dag')
exports.object = require('./object')
exports.pin = require('./pin')

exports.bootstrap = require('./bootstrap')
exports.dht = require('./dht')
exports.name = require('./name')
exports.namePubsub = require('./name-pubsub')
exports.ping = require('./ping')
exports.pubsub = require('./pubsub')
exports.swarm = require('./swarm')

exports.config = require('./config')
exports.key = require('./key')
exports.miscellaneous = require('./miscellaneous')
exports.repo = require('./repo')
exports.stats = require('./stats')
