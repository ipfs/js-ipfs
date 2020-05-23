'use strict'

/**
 * @typedef {ReturnType<import('./add')>} Add
 */
exports.add = require('./add')

/**
 * @typedef {Object} Block
 */
exports.block = {
  get: require('./block/get'),
  put: require('./block/put'),
  rm: require('./block/rm'),
  stat: require('./block/stat')
}

/**
 * @typedef {Object} BitSwap
 */
exports.bitswap = {
  stat: require('./bitswap/stat'),
  unwant: require('./bitswap/unwant'),
  wantlist: require('./bitswap/wantlist')
}

/**
 * @typedef {Object} Bootstrap
 */
exports.bootstrap = {
  add: require('./bootstrap/add'),
  list: require('./bootstrap/list'),
  rm: require('./bootstrap/rm')
}

/**
 * @typedef {Object} Cat
 */
exports.cat = require('./cat')

/**
 * @typedef {Object} Config
 */
exports.config = require('./config')

/**
 * @typedef {Object} DAG
 * @property {ReturnType<import('./dag/get')>} get
 * @property {ReturnType<import('./dag/put')>} put
 * @property {ReturnType<import('./dag/resolve')>} resolve
 * @property {ReturnType<import('./dag/tree')>} tree
 */
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

/**
 * @typedef Pin
 * @property {ReturnType<import("./pin/add")>} add
 * @property {ReturnType<import("./pin/ls")>} ls
 * @property {ReturnType<import("./pin/rm")>} rm
 */
exports.pin = {
  add: require('./pin/add'),
  ls: require('./pin/ls'),
  rm: require('./pin/rm')
}

/**
 * @typedef {ReturnType<import('./ping')>} Ping
 */
exports.ping = require('./ping')
exports.pubsub = require('./pubsub')

/** @type {import('./refs') & {local:import('./refs/local')}} */
// @ts-ignore
exports.refs = require('./refs')
exports.refs.local = require('./refs/local')
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

/**
 * @typedef {ReturnType<import('./version')>} Version
 */
exports.version = require('./version')
