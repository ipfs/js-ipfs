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
exports.libp2p = require('./libp2p')
exports.ping = require('./ping')
exports.start = require('./start')
exports.stop = require('./stop')
exports.swarm = {
  addrs: require('./swarm/addrs'),
  connect: require('./swarm/connect'),
  disconnect: require('./swarm/disconnect'),
  localAddrs: require('./swarm/localAddrs'),
  peers: require('./swarm/peers')
}
exports.version = require('./version')

exports.legacy = { // TODO: these will be removed as the new API is completed
  dag: require('./dag'),
  pin: require('./pin')
}
