import mergeOpts from 'merge-options'
import { isTest } from 'ipfs-utils/src/env.js'
import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import { UnixFS } from 'ipfs-unixfs'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as dagJOSE from 'dag-jose'
import { identity } from 'multiformats/hashes/identity'
import { bases, hashes, codecs } from 'multiformats/basics'
import { initAssets } from 'ipfs-core-config/init-assets'
import { AlreadyInitializedError } from '../errors.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { createStart } from './start.js'

import { createStop } from './stop.js'
import { createDns } from './dns.js'
import { createIsOnline } from './is-online.js'
import { createResolve } from './resolve.js'
import { PinAPI } from './pin/index.js'
import { IPNSAPI } from './ipns.js'
import { NameAPI } from './name/index.js'
import { createRefs } from './refs/index.js'
import { createLocal } from './refs/local.js'
import { BitswapAPI } from './bitswap/index.js'
import { BootstrapAPI } from './bootstrap/index.js'
import { BlockAPI } from './block/index.js'
import { RootAPI } from './root.js'
import { createVersion } from './version.js'
import { createId } from './id.js'
import { createConfig } from './config/index.js'
import { DagAPI } from './dag/index.js'
import { createPreloader } from '../preload.js'
import { createMfsPreloader } from '../mfs-preload.js'
import { createFiles } from './files/index.js'
import { KeyAPI } from './key/index.js'
import { ObjectAPI } from './object/index.js'
import { RepoAPI } from './repo/index.js'
import { StatsAPI } from './stats/index.js'
import { Storage } from './storage.js'
import { Network } from './network.js'
import { Service } from '../utils/service.js'
import { SwarmAPI } from './swarm/index.js'
import { createPing } from './ping.js'
import { createDht } from './dht.js'
import { createPubsub } from './pubsub.js'
import { Multicodecs } from 'ipfs-core-utils/multicodecs'
import { Multihashes } from 'ipfs-core-utils/multihashes'
import { Multibases } from 'ipfs-core-utils/multibases'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs')

/**
 * @typedef {import('../types').Options} Options
 * @typedef {import('../types').Print} Print
 * @typedef {import('./storage')} StorageAPI
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 */

class IPFS {
  /**
   * @param {object} config
   * @param {Print} config.print
   * @param {Storage} config.storage
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
   * @param {Options} config.options
   */
  constructor ({ print, storage, codecs, options }) {
    const { peerId, repo, keychain } = storage
    const network = Service.create(Network)

    const preload = createPreloader(options.preload)

    const dns = createDns()
    const isOnline = createIsOnline({ network })
    // @ts-expect-error This type check fails as options.
    // libp2p can be a function, while IPNS router config expects libp2p config
    const ipns = new IPNSAPI(options)

    /** @type {MultihashHasher[]} */
    const multihashHashers = Object.values(hashes);

    (options.ipld && options.ipld.hashers ? options.ipld.hashers : []).forEach(hasher => multihashHashers.push(hasher))

    this.hashers = new Multihashes({
      hashers: multihashHashers,
      loadHasher: options.ipld && options.ipld.loadHasher
    })

    /** @type {MultibaseCodec[]} */
    const multibaseCodecs = Object.values(bases);

    (options.ipld && options.ipld.bases ? options.ipld.bases : []).forEach(base => multibaseCodecs.push(base))

    this.bases = new Multibases({
      bases: multibaseCodecs,
      loadBase: options.ipld && options.ipld.loadBase
    })

    const pin = new PinAPI({ repo, codecs })
    const block = new BlockAPI({ codecs, hashers: this.hashers, preload, repo })

    const name = new NameAPI({
      dns,
      ipns,
      repo,
      codecs,
      peerId,
      isOnline,
      keychain,
      options
    })

    const resolve = createResolve({ repo, codecs, bases: this.bases, name })

    const dag = new DagAPI({ repo, codecs, hashers: this.hashers, preload })
    const refs = Object.assign(createRefs({ repo, codecs, resolve, preload }), {
      local: createLocal({ repo: storage.repo })
    })
    const { add, addAll, cat, get, ls } = new RootAPI({
      preload,
      repo,
      options: options.EXPERIMENTAL,
      hashers: this.hashers
    })

    const files = createFiles({
      repo,
      preload,
      hashers: this.hashers,
      options
    })

    const mfsPreload = createMfsPreloader({
      files,
      preload,
      options: options.preload
    })

    this.preload = preload
    this.name = name
    this.ipns = ipns
    this.pin = pin
    this.resolve = resolve
    this.block = block
    this.refs = refs

    this.start = createStart({
      network,
      peerId,
      repo,
      preload,
      ipns,
      mfsPreload,
      print,
      keychain,
      hashers: this.hashers,
      options
    })

    this.stop = createStop({
      network,
      preload,
      mfsPreload,
      ipns,
      repo
    })

    this.dht = createDht({ network, repo, peerId })
    this.pubsub = createPubsub({ network, config: options.config })
    this.dns = dns
    this.isOnline = isOnline
    this.id = createId({ network, peerId })
    this.version = createVersion({ repo })
    this.bitswap = new BitswapAPI({ network })
    this.bootstrap = new BootstrapAPI({ repo })
    this.config = createConfig({ repo })
    this.ping = createPing({ network })

    this.add = add
    this.addAll = addAll
    this.cat = cat
    this.get = get
    this.ls = ls

    this.dag = dag
    this.files = files
    this.key = new KeyAPI({ keychain })
    this.object = new ObjectAPI({ preload, codecs, repo })
    this.repo = new RepoAPI({ repo, hashers: this.hashers })
    this.stats = new StatsAPI({ repo, network })
    this.swarm = new SwarmAPI({ network })

    // For the backwards compatibility
    Object.defineProperty(this, 'libp2p', {
      get () {
        const net = network.try()
        return net ? net.libp2p : undefined
      }
    })

    // unimplemented methods
    const notImplemented = () => Promise.reject(errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED'))
    const notImplementedIter = async function * () { throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED') } // eslint-disable-line require-yield
    this.commands = notImplemented
    this.diag = {
      cmds: notImplemented,
      net: notImplemented,
      sys: notImplemented
    }
    this.log = {
      level: notImplemented,
      ls: notImplemented,
      tail: notImplementedIter
    }
    this.mount = notImplemented

    this.codecs = codecs
  }

  /**
   * `IPFS.create` will do the initialization. Keep this around for backwards
   * compatibility.
   *
   * @deprecated
   */
  async init () { // eslint-disable-line require-await
    throw new AlreadyInitializedError()
  }
}

/**
 * @param {IPFS} ipfs
 */
const addEmptyDir = async (ipfs) => {
  const buf = dagPB.encode({
    Data: new UnixFS({ type: 'directory' }).marshal(),
    Links: []
  })

  const cid = await ipfs.block.put(buf, {
    mhtype: 'sha2-256',
    format: 'dag-pb'
  })

  await ipfs.pin.add(cid)

  return cid
}

/**
 * @returns {Options}
 */
const getDefaultOptions = () => ({
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
 * @param {Options} options
 */
export async function create (options = {}) {
  options = mergeOptions(getDefaultOptions(), options)
  const initOptions = options.init || {}

  /**
   * @type {BlockCodec}
   */
  const id = {
    name: identity.name,
    code: identity.code,
    encode: (id) => id,
    decode: (id) => id
  }

  /** @type {BlockCodec[]} */
  const blockCodecs = Object.values(codecs);

  [dagPB, dagCBOR, dagJSON, dagJOSE, id].concat((options.ipld && options.ipld.codecs) || []).forEach(codec => blockCodecs.push(codec))

  const multicodecs = new Multicodecs({
    codecs: blockCodecs,
    loadCodec: options.ipld && options.ipld.loadCodec
  })

  // eslint-disable-next-line no-console
  const print = options.silent ? log : console.log

  log('creating repo')
  const storage = await Storage.start(print, multicodecs, options)

  log('getting repo config')
  const config = await storage.repo.config.getAll()

  const ipfs = new IPFS({
    storage,
    print,
    codecs: multicodecs,
    options: { ...options, config }
  })

  log('starting preload')
  await ipfs.preload.start()

  log('starting storage')
  ipfs.ipns.startOffline(storage)

  if (storage.isNew && !initOptions.emptyRepo) {
    // add empty unixfs dir object (go-ipfs assumes this exists)
    const cid = await addEmptyDir(ipfs)

    log('adding default assets')
    await initAssets({ addAll: ipfs.addAll, print })

    log('initializing IPNS keyspace')

    if (storage.peerId.publicKey == null) {
      throw errCode(new Error('Public key missing'), 'ERR_MISSING_PUBLIC_KEY')
    }

    await ipfs.ipns.initializeKeyspace(storage.peerId, uint8ArrayFromString(`/ipfs/${cid}`))
  }

  if (options.start !== false) {
    log('starting node')
    await ipfs.start()
  }

  return ipfs
}
