'use strict'

const log = require('debug')('ipfs')
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
 * @typedef {'rsa' | 'ed25519' | 'secp256k1'} KeyType
 *
 * @typedef {object} InitOptions
 * @property {boolean} [emptyRepo] - Whether to remove built-in assets, like the instructional tour and empty mutable file system, from the repo. (Default: `false`)
 * @property {KeyType} [algorithm] - The type of key to use. (Default: `rsa`)
 * @property {number} [bits] - Number of bits to use in the generated key pair (rsa only). (Default: `2048`)
 * @property {string | import('peer-id')} [privateKey] - A pre-generated private key to use. Can be either a base64 string or a [PeerId](https://github.com/libp2p/js-peer-id) instance. **NOTE: This overrides `bits`.**
 * @property {string} [pass] - A passphrase to encrypt keys. You should generally use the [top-level `pass` option](#optionspass) instead of the `init.pass` option (this one will take its value from the top-level option if not set).
 * @property {any[]} [profiles] - Apply profile settings to config.
 * @property {boolean} [allowNew] - Set to `false` to disallow initialization if the repo does not already exist. (Default: `true`)
 *
 * @typedef {object} RelayOptions
 * @property {boolean} [enabled] - Enable circuit relay dialer and listener. (Default: `true`)
 * @property {object} [hop]
 * @property {boolean=} [hop.enabled] - Make this node a relay (other nodes can connect *through* it). (Default: `false`)
 * @property {boolean=} [hop.active] - Make this an *active* relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: `false`)
 *
 * @typedef {object} PreloadOptions
 * @property {boolean} [enabled] - Enable content preloading (Default: `true`)
 * @property {string[]} [addresses] - Multiaddr API addresses of nodes that should preload content.
 *                                  - **NOTE:** nodes specified here should also be added to your node's bootstrap address list at `config.Boostrap`.
 *
 * @typedef {object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub] - Enable pub-sub on IPNS. (Default: `false`)
 * @property {boolean} [sharding] - Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)
 */

/**
 * @typedef { import('ipfs-repo') } IpfsRepo
 */

/**
 * Creates and returns a ready to use instance of an IPFS node.
 *
 * @template {boolean | InitOptions} INIT
 * @template {boolean} START
 *
 * @param {object} [options] - specify advanced configuration
 * @param {string | IpfsRepo} [options.repo] - The file path at which to store the IPFS node’s data. Alternatively, you can set up a customized storage system by providing an [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance. (Default: `'~/.jsipfs'` in Node.js, `'ipfs'` in browsers)
 * @param {boolean} [options.repoAutoMigrate] - `js-ipfs` comes bundled with a tool that automatically migrates your IPFS repository when a new version is available. (Default: `true`)
 * @param {INIT} [options.init] - Perform repo initialization steps when creating the IPFS node. (Default: `true`)
 *                              - Note that *initializing* a repo is different from creating an instance of [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor sets many special properties when initializing a repo, so you should usually not try and call `repoInstance.init()` yourself.
 * @param {START} [options.start] - If `false`, do not automatically start the IPFS node. Instead, you’ll need to manually call [`node.start()`](#nodestart) yourself. (Default: `true`)
 * @param {string} [options.pass] - A passphrase to encrypt/decrypt your keys. (Default: `null`)
 * @param {boolean} [options.silent] - Prevents all logging output from the IPFS node. (Default: `false`)
 * @param {RelayOptions} [options.relay] - Configure circuit relay (see the [circuit relay tutorial](https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying) to learn more). (Default: `{ enabled: true, hop: { enabled: false, active: false } }`)
 * @param {boolean} [options.offline] - Run ipfs node offline. The node does not connect to the rest of the network but provides a local API. (Default: `false`)
 * @param {PreloadOptions} [options.preload] - Configure remote preload nodes. The remote will preload content added on this node, and also attempt to preload objects requested by this node.
 * @param {ExperimentalOptions} [options.EXPERIMENTAL] - Enable and configure experimental features.
 * @param {object} [options.config] - Modify the default IPFS node config. This object will be *merged* with the default config; it will not replace it. (Default: [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-nodejs.js) in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-browser.js) in browsers)
 * @param {object} [options.ipld] - Modify the default IPLD config. This object will be *merged* with the default config; it will not replace it. Check IPLD [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information on the available options. (Default: [`ipld-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld-nodejs.js) in Node.js, [`ipld-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld-browser.js) in browsers)
 * @param {object | Function} [options.libp2p] - The libp2p option allows you to build your libp2p node by configuration, or via a bundle function. If you are looking to just modify the below options, using the object format is the quickest way to get the default features of libp2p. If you need to create a more customized libp2p node, such as with custom transports or peer/content routers that need some of the ipfs data on startup, a custom bundle is a great way to achieve this.
 *                                             - You can see the bundle in action in the [custom libp2p example](https://github.com/ipfs/js-ipfs/tree/master/examples/custom-libp2p).
 *                                             - Please see [libp2p/docs/CONFIGURATION.md](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md) for the list of options libp2p supports.
 *                                             - Default: [`libp2p-nodejs.js`](../src/core/runtime/libp2p-nodejs.js) in Node.js, [`libp2p-browser.js`](../src/core/runtime/libp2p-browser.js) in browsers
 */
async function create (options) {
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
   * @template T, THEN, ELSE
   * @typedef {NonNullable<T> extends false
   *            ? THEN : ELSE } IsFalse
   */
  /** @type {IsFalse<INIT, typeof api, IsFalse<START, typeof initializedApi, typeof startedApi>>} */
  // @ts-ignore
  const ipfs = startedApi || initializedApi || api
  return ipfs
}

module.exports = {
  create,
  crypto,
  isIPFS,
  Buffer,
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
