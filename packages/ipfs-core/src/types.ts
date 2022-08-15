import type { KeyType } from '@libp2p/interface-keys'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Config as IPFSConfig } from 'ipfs-core-types/src/config'
import type { Libp2p, Libp2pOptions } from 'libp2p'
import type { IPFSRepo } from 'ipfs-repo'
import type { ProgressCallback as MigrationProgressCallback } from 'ipfs-repo-migrations'
import type { Network, Options as NetworkOptions } from './components/network'
import type { Datastore } from 'interface-datastore'
import type { Service } from './utils/service'
import type { CID } from 'multiformats/cid'
import type { BlockCodec } from 'multiformats/codecs/interface'
import type { MultibaseCodec } from 'multiformats/bases/interface'
import type { MultihashHasher } from 'multiformats/hashes/interface'

export interface Options {
  /**
   * Initialization options of the IPFS node.
   * Note that *initializing* a repo is different from creating an instance of
   * [`ipfs-repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor
   * sets many special properties when initializing a repo, so you should usually
   * not try and call `repoInstance.init()` yourself.
   */
  init?: InitOptions

  /**
   * If `false`, do not automatically start the IPFS node. Instead, you’ll need to manually call
   * [`node.start()`](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/MODULE.md#nodestart)
   * yourself.
   */
  start?: boolean

  /**
   * A passphrase to encrypt/decrypt keys stored in your keychain
   */
  pass?: string

  /**
   * Configure circuit relay (see the [circuit relay tutorial](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples/circuit-relaying)
   * to learn more)
   */
  relay?: RelayOptions

  /**
   * Run ipfs node offline. The node does not connect to the rest of the network
   * but APIs that do not require network access will still work.
   */
  offline?: boolean

  /**
   * Configure remote preload nodes. The remote will preload content added on this node,
   * and also attempt to preload objects requested by this node.
   */
  preload?: PreloadOptions

  /**
   * Enable and configure experimental features
   */
  EXPERIMENTAL?: ExperimentalOptions

  /**
   * Modify the default IPFS node config. This object will be *merged* with the default config; it will not replace it.
   * (Default: [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/config-nodejs.js)
   * in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/config-browser.js)
   * in browsers)
   */
  config?: IPFSConfig

  /**
   * If multiple instances of IPFS are accessing the same repo - e.g. via node cluster or browser UI and webworkers
   * one instance must be designated the repo owner to hold the lock on shared resources like the datastore.
   *
   * Set this property to true on one instance only if this is how your application is set up.
   */
  repoOwner?: boolean

  /**
   * The file path at which to store the IPFS node’s data. Alternatively, you can set up a customized
   * storage system by providing an Repo implementation. (In browser default is 'ipfs').
   */
  repo?: IPFSRepo | string

  /**
   * Occasionally a repo migration is necessary - pass true here to to this automatically at startup
   * when a new version of IPFS is being run for the first time and a migration is necessary, otherwise
   * the node will refuse to start
   */
  repoAutoMigrate?: boolean

  /**
   * Pass a function here to be notified of progress when a repo migration is taking place
   */
  onMigrationProgress?: MigrationProgressCallback

  /**
   * To speed up peers store access, the data associated with this many peers is kept in memory in
   * a least-recently used cache. The default is 1024. To hold all peers in memory at all times set
   * this to Infinity.
   */
  peerStoreCacheSize?: number

  /**
   * Modify the default IPLD config. This object
   * will be *merged* with the default config; it will not replace it. Check IPLD
   * [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information
   * on the available options. (Default: [`ipld.js`]
   * (https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/ipld-nodejs.js) in Node.js, [`ipld-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/ipld-browser.js)
   * (https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/ipld.js)
   * in browsers)
   */
  ipld?: Partial<IPLDOptions>

  /**
   * The libp2p option allows you to build
   * your libp2p node by configuration, or via a bundle function. If you are
   * looking to just modify the below options, using the object format is the
   * quickest way to get the default features of libp2p. If you need to create a
   * more customized libp2p node, such as with custom transports or peer/content
   * routers that need some of the ipfs data on startup, a custom bundle is a
   * great way to achieve this.
   * - You can see the bundle in action in the [custom libp2p example](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examplescustom-libp2p).
   * - Please see [libp2p/docs/CONFIGURATION.md](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md)
   * for the list of options libp2p supports.
   * - Default: [`libp2p-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/libp2p-nodejs.js)
   * in Node.js, [`libp2p-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core-config/src/libp2p-browser.js) in
   * browsers.
   */
  libp2p?: Partial<Libp2pOptions> | Libp2pFactoryFn

  silent?: boolean
}

export interface Libp2pFactoryFnArgs {
  libp2pOptions: Libp2pOptions
  options: Options
  config: IPFSConfig
  datastore: Datastore
  peerId: PeerId
}

export interface Libp2pFactoryFn {
  (args: Libp2pFactoryFnArgs): Promise<Libp2p>
}

/**
 * On first run js-IPFS will initialize a repo which can be customized through this settings
 */
export interface InitOptions {
  /**
   * Whether to remove built-in assets, like the instructional tour and empty mutable file system, from the repo
   */
  emptyRepo?: boolean

  /**
   * The type of key to use
   */
  algorithm?: KeyType

  /**
   * Number of bits to use in the generated key pair (rsa only)
   */
  bits?: number

  /**
   * A pre-generated private key to use
   * **NOTE: This overrides `bits`.**
   */
  privateKey?: PeerId|string

  /**
   * Apply profile settings to config
   */
  profiles?: string[]

  /**
   * Set to `false` to disallow initialization if the repo does not already exist
   */
  allowNew?: boolean
}

export interface RelayOptions {
  /**
   * Enable circuit relay dialer and listener. (Default: `true`)
   */
  enabled?: boolean

  hop?: {
    /**
     * Make this node a relay (other nodes can connect *through* it). (Default: `false`)
     */
    enabled?: boolean

    /**
     * Make this an active relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: false)
     */
    active?: boolean
  }
}

export interface PreloadOptions {
  /**
   * Whether to preload anything
   */
  enabled?: boolean

  /**
   * How many CIDs to cache
   */
  cache?: number

  /**
   * Which preload servers to use.  **NOTE:** nodes specified here should also be added to your node's
   * bootstrap address list at `config.Boostrap`
   */
  addresses?: string[]
}

export interface ExperimentalOptions {
  /**
   * Enable pub-sub on IPNS. (Default: `false`)
   */
  ipnsPubsub?: boolean

  /**
   * Enable directory sharding. Directories that have many child objects will be represented by multiple
   * DAG nodes instead of just one. It can improve lookup performance when a directory has several
   * thousand files or more. (Default: `false`)
   */
  sharding?: boolean
}

/**
 * Prints output to the console
 */
export interface Print { (...args: any[]): void }

export interface Preload {
  (cid: CID): void
  start: () => void
  stop: () => void
}

export interface MfsPreload {
  start: () => void
  stop: () => void
}

export type NetworkService = Service<NetworkOptions, Network>

export interface LoadBaseFn { (codeOrName: number | string): Promise<MultibaseCodec<any>> }
export interface LoadCodecFn { (codeOrName: number | string): Promise<BlockCodec<any, any>> }
export interface LoadHasherFn { (codeOrName: number | string): Promise<MultihashHasher> }

export interface IPLDOptions {
  loadBase: LoadBaseFn
  loadCodec: LoadCodecFn
  loadHasher: LoadHasherFn
  bases: Array<MultibaseCodec<any>>
  codecs: Array<BlockCodec<any, any>>
  hashers: MultihashHasher[]
}
