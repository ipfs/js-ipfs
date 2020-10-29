'use strict'

const log = require('debug')('ipfs')

/** @type {typeof Object.assign} */
const mergeOptions = require('merge-options')
const { isTest } = require('ipfs-utils/src/env')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const PeerId = require('peer-id')
const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihashing = require('multihashing-async')
const multihash = multihashing.multihash
const CID = require('cids')
const { NotInitializedError } = require('./errors')
const Components = require('./components')
const ApiManager = require('./api-manager')

const getDefaultOptions = () => ({
  init: true,
  start: true,
  EXPERIMENTAL: {},
  preload: {
    enabled: !isTest, // preload by default, unless in test env
    addresses: [
      '/dns4/node0.preload.ipfs.io/https',
      '/dns4/node1.preload.ipfs.io/https',
      '/dns4/node2.preload.ipfs.io/https',
      '/dns4/node3.preload.ipfs.io/https'
    ]
  }
})

/**
 * Creates and returns a ready to use instance of an IPFS node.
 *
 * @template {boolean | InitOptions} Init
 * @template {boolean} Start
 * @param {CreateOptions<Init, Start>} [options]
 */
async function create (options = {}) {
  options = mergeOptions(getDefaultOptions(), options)

  // eslint-disable-next-line no-console
  const print = options.silent ? log : console.log

  const apiManager = new ApiManager()

  const { api } = apiManager.update({
    init: Components.init({ apiManager, print, options }),
    dns: Components.dns(),
    isOnline: Components.isOnline({ libp2p: undefined })
  }, async () => { throw new NotInitializedError() }) // eslint-disable-line require-await

  const initializedApi = options.init && await api.init()
  const startedApi = options.start && initializedApi && await initializedApi.start()

  /**
   * create returns object that has different API set based on `options.init`
   * and `options.start` values. If we just return `startedApi || initializedApi || api`
   * TS will infer return type to be ` typeof startedAPI || typeof initializedApi || typeof api`
   * which user would in practice act like `api` with all the extra APIs as optionals.
   *
   * Type trickery below attempts to affect inference by explicitly telling
   * what the return type is and when.
   *
   * @typedef {typeof api} API
   * @typedef {NonNullable<typeof initializedApi>} InitializedAPI
   * @typedef {NonNullable<typeof startedApi>} StartedAPI
   * @type {If<Init, If<Start, StartedAPI, InitializedAPI>, API>}
   */
  // @ts-ignore
  const ipfs = startedApi || initializedApi || api
  return ipfs
}

module.exports = {
  create,
  crypto,
  isIPFS,
  CID,
  multiaddr,
  multibase,
  multihash,
  multihashing,
  multicodec,
  PeerId,
  globSource,
  urlSource
}

/**
 * @template {boolean | InitOptions} Init
 * @template {boolean} Start
 *
 * @typedef {Object} CreateOptions
 * Options argument can be used to specify advanced configuration.
 * @property {RepoOption} [repo='~/.jsipfs']
 * @property {boolean} [repoAutoMigrate=true] - `js-ipfs` comes bundled with a
 * tool that automatically migrates your IPFS repository when a new version is
 * available.
 * @property {Init} [init=true] - Perform repo initialization steps when creating
 * the IPFS node.
 * Note that *initializing* a repo is different from creating an instance of
 * [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor
 * sets many special properties when initializing a repo, so you should usually
 * not try and call `repoInstance.init()` yourself.
 * @property {Start} [start=true] - If `false`, do not automatically
 * start the IPFS node. Instead, you’ll need to manually call
 * [`node.start()`](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/MODULE.md#nodestart)
 * yourself.
 * @property {string} [pass=null] - A passphrase to encrypt/decrypt your keys.
 * @property {boolean} [silent=false] - Prevents all logging output from the
 * IPFS node. (Default: `false`)
 * @property {RelayOptions} [relay={ enabled: true, hop: { enabled: false, active: false } }]
 * - Configure circuit relay (see the [circuit relay tutorial]
 * (https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying)
 * to learn more).
 * @property {boolean} [offline=false] - Run ipfs node offline. The node does
 * not connect to the rest of the network but provides a local API.
 * @property {PreloadOptions} [preload] - Configure remote preload nodes.
 * The remote will preload content added on this node, and also attempt to
 * preload objects requested by this node.
 * @property {ExperimentalOptions} [EXPERIMENTAL] - Enable and configure
 * experimental features.
 * @property {object} [config] - Modify the default IPFS node config. This
 * object will be *merged* with the default config; it will not replace it.
 * (Default: [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-nodejs.js)
 * in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-browser.js)
 * in browsers)
 * @property {import('./components').IPLDConfig} [ipld] - Modify the default IPLD config. This object
 * will be *merged* with the default config; it will not replace it. Check IPLD
 * [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information
 * on the available options. (Default: [`ipld.js`]
 * (https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld.js)
 * in browsers)
 * @property {object|Function} [libp2p] - The libp2p option allows you to build
 * your libp2p node by configuration, or via a bundle function. If you are
 * looking to just modify the below options, using the object format is the
 * quickest way to get the default features of libp2p. If you need to create a
 * more customized libp2p node, such as with custom transports or peer/content
 * routers that need some of the ipfs data on startup, a custom bundle is a
 * great way to achieve this.
 * - You can see the bundle in action in the [custom libp2p example](https://github.com/ipfs/js-ipfs/tree/master/examples/custom-libp2p).
 * - Please see [libp2p/docs/CONFIGURATION.md](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md)
 * for the list of options libp2p supports.
 * - Default: [`libp2p-nodejs.js`](../src/core/runtime/libp2p-nodejs.js)
 * in Node.js, [`libp2p-browser.js`](../src/core/runtime/libp2p-browser.js) in
 * browsers.
 */

/**
 * @typedef {IPFSRepo|string} RepoOption
 * The file path at which to store the IPFS node’s data. Alternatively, you
 * can set up a customized storage system by providing an `ipfs.Repo` instance.
 *
 * @example
 * ```js
 * // Store data outside your user directory
 * const node = await IPFS.create({ repo: '/var/ipfs/data' })
 * ```
 * @typedef {import('./components/init').InitOptions} InitOptions
 *
 * @typedef {object} RelayOptions
 * @property {boolean} [enabled] - Enable circuit relay dialer and listener. (Default: `true`)
 * @property {object} [hop]
 * @property {boolean} [hop.enabled] - Make this node a relay (other nodes can connect *through* it). (Default: `false`)
 * @property {boolean} [hop.active] - Make this an *active* relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: `false`)
 *
 * @typedef {object} PreloadOptions
 * @property {boolean} [enabled] - Enable content preloading (Default: `true`)
 * @property {string[]} [addresses] - Multiaddr API addresses of nodes that should preload content.
 * **NOTE:** nodes specified here should also be added to your node's bootstrap address list at `config.Boostrap`.
 *
 * @typedef {object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub] - Enable pub-sub on IPNS. (Default: `false`)
 * @property {boolean} [sharding] - Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)
 *
 * @typedef {import('./components').IPFSRepo} IPFSRepo
 */

/**
 * Utility type to write type level conditionals
 *
 * @template Conditon, Then, Else
 * @typedef {NonNullable<Conditon> extends false ? Else : Then } If
 */
