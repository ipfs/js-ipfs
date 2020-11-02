'use strict'

/**
 * @typedef {ReturnType<typeof import('./add')>} Add
 */
exports.add = require('./add')

/**
 * @typedef {ReturnType<typeof import('./add-all')>} AddAll
 */

exports.addAll = require('./add-all')

/**
 * @typedef {Object} Block
 * @property {ReturnType<typeof import('./block/get')>} get
 * @property {ReturnType<typeof import('./block/put')>} put
 * @property {ReturnType<typeof import('./block/rm')>} rm
 * @property {ReturnType<typeof import('./block/stat')>} stat
 */
exports.block = {
  get: require('./block/get'),
  put: require('./block/put'),
  rm: require('./block/rm'),
  stat: require('./block/stat')
}

/**
 * @typedef {Object} BitSwap
 * @property {ReturnType<typeof import('./bitswap/stat')>} stat
 * @property {ReturnType<typeof import('./bitswap/unwant')>} unwant
 * @property {ReturnType<typeof import('./bitswap/wantlist')>} wantlist
 */
exports.bitswap = {
  stat: require('./bitswap/stat'),
  unwant: require('./bitswap/unwant'),
  wantlist: require('./bitswap/wantlist'),
  wantlistForPeer: require('./bitswap/wantlist-for-peer')
}

/**
 * @typedef {Object} Bootstrap
 * @property {ReturnType<typeof import('./bootstrap/add')>} add
 * @property {ReturnType<typeof import('./bootstrap/list')>} list
 * @property {ReturnType<typeof import('./bootstrap/rm')>} rm
 */
exports.bootstrap = {
  add: require('./bootstrap/add'),
  clear: require('./bootstrap/clear'),
  list: require('./bootstrap/list'),
  reset: require('./bootstrap/reset'),
  rm: require('./bootstrap/rm')
}

/**
 * @typedef {ReturnType<typeof import('./cat')>} Cat
 */
exports.cat = require('./cat')

/**
 * @typedef {ReturnType<typeof import('./config')>} Config
 */
exports.config = require('./config')

/**
 * @typedef {Object} DAG
 * @property {ReturnType<typeof import('./dag/get')>} get
 * @property {ReturnType<typeof import('./dag/put')>} put
 * @property {ReturnType<typeof import('./dag/resolve')>} resolve
 * @property {ReturnType<typeof import('./dag/tree')>} tree
 */
exports.dag = {
  get: require('./dag/get'),
  put: require('./dag/put'),
  resolve: require('./dag/resolve'),
  tree: require('./dag/tree')
}

/** @typedef {ReturnType<typeof import('./dht')>} DHT */
exports.dht = require('./dht')

/** @typedef {ReturnType<typeof import('./dns')>} DNS */
exports.dns = require('./dns')

/** @typedef {ReturnType<typeof import('./files')>} Files */
exports.files = require('./files')

/** @typedef {ReturnType<typeof import('./get')>} Get */
exports.get = require('./get')

/** @typedef {ReturnType<typeof import('./id')>} ID */
exports.id = require('./id')

/** @typedef {ReturnType<typeof import('./init')>} Init */
exports.init = require('./init')

/** @typedef {ReturnType<typeof import('./is-online')>} IsOnline */
exports.isOnline = require('./is-online')

/**
 * @typedef {Object} Key
 * @property {ReturnType<typeof import('./key/export')>} export
 * @property {ReturnType<typeof import('./key/gen')>} gen
 * @property {ReturnType<typeof import('./key/import')>} import
 * @property {ReturnType<typeof import('./key/info')>} info
 * @property {ReturnType<typeof import('./key/list')>} list
 * @property {ReturnType<typeof import('./key/rename')>} rename
 * @property {ReturnType<typeof import('./key/rm')>} rm
 */

exports.key = {
  export: require('./key/export'),
  gen: require('./key/gen'),
  import: require('./key/import'),
  info: require('./key/info'),
  list: require('./key/list'),
  rename: require('./key/rename'),
  rm: require('./key/rm')
}

/** @typedef {ReturnType<typeof import('./libp2p')>} LibP2P */
exports.libp2p = require('./libp2p')

/** @typedef {ReturnType<typeof import('./ls')>} LS */
exports.ls = require('./ls')

/**
 * @typedef {Object} Name
 * @property {ReturnType<typeof import('./name/publish')>} publish
 * @property {ReturnType<typeof import('./name/resolve')>} resolve
 * @property {NamePubSub} pubsub
 *
 * @typedef {Object} NamePubSub
 * @property {ReturnType<typeof import('./name/pubsub/cancel')>} cancel
 * @property {ReturnType<typeof import('./name/pubsub/state')>} state
 * @property {ReturnType<typeof import('./name/pubsub/subs')>} subs
 */

exports.name = {
  publish: require('./name/publish'),
  pubsub: {
    cancel: require('./name/pubsub/cancel'),
    state: require('./name/pubsub/state'),
    subs: require('./name/pubsub/subs')
  },
  resolve: require('./name/resolve')
}

/**
 * @typedef {Object} ObjectAPI
 * @property {ReturnType<typeof import('./object/data')>} data
 * @property {ReturnType<typeof import('./object/get')>} get
 * @property {ReturnType<typeof import('./object/links')>} links
 * @property {ReturnType<typeof import('./object/new')>} new
 * @property {ReturnType<typeof import('./object/put')>} put
 * @property {ReturnType<typeof import('./object/stat')>} stat
 * @property {ObjectPath} patch
 *
 * @typedef {Object} ObjectPath
 * @property {ReturnType<typeof import('./object/patch/add-link')>} addLink
 * @property {ReturnType<typeof import('./object/patch/rm-link')>} rmLink
 * @property {ReturnType<typeof import('./object/patch/append-data')>} appendData
 * @property {ReturnType<typeof import('./object/patch/set-data')>} setData
 */
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
 * @property {ReturnType<typeof import("./pin/add")>} add
 * @property {ReturnType<typeof import("./pin/add-all")>} addAll
 * @property {ReturnType<typeof import("./pin/ls")>} ls
 * @property {ReturnType<typeof import("./pin/rm")>} rm
 */
exports.pin = {
  add: require('./pin/add'),
  addAll: require('./pin/add-all'),
  ls: require('./pin/ls'),
  rm: require('./pin/rm'),
  rmAll: require('./pin/rm-all')
}

/**
 * @typedef {ReturnType<typeof import('./ping')>} Ping
 */
exports.ping = require('./ping')

/**
 * @typedef {ReturnType<typeof import('./pubsub')>} PubSub
 */
exports.pubsub = require('./pubsub')

/**
 * @typedef {ReturnType<typeof import('./refs')>} Refs
 * @typedef {ReturnType<typeof import('./refs/local')>} LocalRefs
 * @typedef {Refs & {local:LocalRefs}} RefsWithLocal
 */
exports.refs = Object.assign(require('./refs'), { local: require('./refs/local') })

/**
 * @typedef {Object} Repo
 * @property {ReturnType<typeof import("./repo/gc")>} gc
 * @property {ReturnType<typeof import("./repo/stat")>} stat
 * @property {ReturnType<typeof import("./repo/version")>} version
 */
exports.repo = {
  gc: require('./repo/gc'),
  stat: require('./repo/stat'),
  version: require('./repo/version')
}

/** @typedef {ReturnType<typeof import('./resolve')>} Resolve */
exports.resolve = require('./resolve')

/** @typedef {ReturnType<typeof import('./start')>} Start */
exports.start = require('./start')

/**
 * @typedef {Object} Stats
 * @property {ReturnType<typeof import('./stats/bw')>} bw
 */
exports.stats = {
  bw: require('./stats/bw')
}

/** @typedef {ReturnType<typeof import('./stop')>} Stop */
exports.stop = require('./stop')

/**
 * @typedef {Object} Swarm
 * @property {ReturnType<typeof import('./swarm/addrs')>} addrs
 * @property {ReturnType<typeof import('./swarm/connect')>} connect
 * @property {ReturnType<typeof import('./swarm/disconnect')>} disconnect
 * @property {ReturnType<typeof import('./swarm/local-addrs')>} localAddrs
 * @property {ReturnType<typeof import('./swarm/peers')>} peers
 */
exports.swarm = {
  addrs: require('./swarm/addrs'),
  connect: require('./swarm/connect'),
  disconnect: require('./swarm/disconnect'),
  localAddrs: require('./swarm/local-addrs'),
  peers: require('./swarm/peers')
}

/**
 * @typedef {ReturnType<typeof import('./version')>} Version
 */
exports.version = require('./version')

/**
 * @typedef {ReturnType<typeof import('../preload')>} Preload
 * @typedef {RWLock} GCLock
 *
 * @typedef {Object} RWLock
 * @property {() => Promise<Lock>} readLock
 * @property {() => Promise<Lock>} writeLock
 *
 * @typedef {() => void} Lock
 *
 * // External library types
 * @typedef {import('cids')} CID
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('multiaddr')} Multiaddr
 *
 * // Justs pretending these things are typed & hopefully in the future they
 * // wil be.
 * @typedef {import('ipld')} IPLD
 * @typedef {import('ipld').Config} IPLDConfig
 * @typedef {import('ipld-block')} IPLDBlock
 * @typedef {import('ipfs-repo')} IPFSRepo
 * @typedef {import('ipfs-block-service')} IPFSBlockService
 * @typedef {import('ipfs-bitswap')} IPFSBitSwap
 * @typedef {import('libp2p')} LibP2PService
 * @typedef {import('libp2p').Config} LibP2PConfig
 */

/**
 * @typedef {Object} IPFSAPI
 * @property {Add} add
 * @property {BitSwap} bitswap
 * @property {Block} block
 * @property {Bootstrap} bootstrap
 * @property {Cat} cat
 * @property {Config} config
 * @property {DAG} dag
 * @property {DHT} dht
 * @property {DNS} dns
 * @property {Files} files
 * @property {Get} get
 * @property {ID} id
 * @property {IsOnline} isOnline
 * @property {Key} key
 * @property {LibP2P} libp2p
 * @property {LS} ls
 * @property {Name} name
 * @property {ObjectAPI} object
 * @property {Pin} pin
 * @property {Ping} ping
 * @property {PubSub} pubsub
 * @property {Refs} refs
 * @property {Repo} repo
 * @property {Resolve} resolve
 * @property {Stats} stats
 * @property {Swarm} swarm
 * @property {Version} version
 *
 * @property {Init} init
 * @property {Start} start
 * @property {Stop} stop
 */
