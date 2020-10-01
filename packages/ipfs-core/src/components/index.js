'use strict'

exports.add = require('./add')
exports.addAll = require('./add-all')
exports.block = {
  get: require('./block/get'),
  put: require('./block/put'),
  rm: require('./block/rm'),
  stat: require('./block/stat')
}
exports.bitswap = {
  stat: require('./bitswap/stat'),
  unwant: require('./bitswap/unwant'),
  wantlist: require('./bitswap/wantlist'),
  wantlistForPeer: require('./bitswap/wantlist-for-peer')
}
exports.bootstrap = {
  add: require('./bootstrap/add'),
  clear: require('./bootstrap/clear'),
  list: require('./bootstrap/list'),
  reset: require('./bootstrap/reset'),
  rm: require('./bootstrap/rm')
}
exports.cat = require('./cat')
exports.config = require('./config')
exports.dag = {
  get: require('./dag/get'),
  put: require('./dag/put'),
  resolve: require('./dag/resolve'),
  tree: require('./dag/tree')
}
exports.dht = require('./dht')
exports.dns = require('./dns')
exports.files = require('./files')
exports.get = require('./get')
exports.id = require('./id')
exports.init = require('./init')
exports.isOnline = require('./is-online')
exports.key = {
  export: require('./key/export'),
  gen: require('./key/gen'),
  import: require('./key/import'),
  info: require('./key/info'),
  list: require('./key/list'),
  rename: require('./key/rename'),
  rm: require('./key/rm')
}
exports.libp2p = require('./libp2p')
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
exports.pin = {
  add: require('./pin/add'),
  addAll: require('./pin/add-all'),
  ls: require('./pin/ls'),
  rm: require('./pin/rm'),
  rmAll: require('./pin/rm-all')
}
exports.ping = require('./ping')
exports.pubsub = require('./pubsub')
exports.refs = Object.assign(require('./refs'), { local: require('./refs/local') })
exports.repo = {
  gc: require('./repo/gc'),
  stat: require('./repo/stat'),
  version: require('./repo/version')
}
exports.resolve = require('./resolve')
exports.start = require('./start')
exports.stats = {
  bw: require('./stats/bw')
}
exports.stop = require('./stop')
exports.swarm = {
  addrs: require('./swarm/addrs'),
  connect: require('./swarm/connect'),
  disconnect: require('./swarm/disconnect'),
  localAddrs: require('./swarm/local-addrs'),
  peers: require('./swarm/peers')
}
exports.version = require('./version')
