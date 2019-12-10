'use strict'

exports.add = require('./add')
exports.cat = require('./cat')
exports.bitswap = {
  stat: require('./bitswap/stat'),
  unwant: require('./bitswap/unwant'),
  wantlist: require('./bitswap/wantlist')
}
exports.config = require('./config')
exports.get = require('./get')
exports.id = require('./id')
exports.init = require('./init')
exports.ls = require('./ls')
exports.name = {
  publish: require('./name/publish'),
  pubsub: {
    cancel: require('./name/pubsub/cancel'),
    state: require('./name/pubsub/state'),
    subs: require('./name/pubsub/subs')
  },
  resolve: require('./name/resolve')
}
exports.object = {
  data: require('./object/data'),
  get: require('./object/get'),
  links: require('./object/links'),
  new: require('./object/new'),
  patch: {
    addLink: require('./object/patch/add-link'),
    appendData: require('./object/patch/append-data'),
    rmLink: require('./object/patch/rm-link'),
    setData: require('./object/patch/set-data')
  },
  put: require('./object/put'),
  stat: require('./object/stat')
}
exports.ping = require('./ping')
exports.start = require('./start')
exports.stop = require('./stop')
exports.refs = require('./refs')
exports.refs.local = require('./refs/local')
exports.version = require('./version')

exports.legacy = { // TODO: these will be removed as the new API is completed
  dag: require('./dag'),
  libp2p: require('./libp2p'),
  pin: require('./pin')
}
