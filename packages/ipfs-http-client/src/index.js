
/* eslint-env browser */

import { Multibases } from 'ipfs-core-utils/multibases'
import { Multicodecs } from 'ipfs-core-utils/multicodecs'
import { Multihashes } from 'ipfs-core-utils/multihashes'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import { identity } from 'multiformats/hashes/identity'
import { bases, hashes, codecs } from 'multiformats/basics'

import { BitswapAPI } from './bitswap/index.js'
import { BlockAPI } from './block/index.js'
import { BootstrapAPI } from './bootstrap/index.js'
import { ConfigAPI } from './config/index.js'
import { DAGAPI } from './dag/index.js'
import { DHTAPI } from './dht/index.js'
import { DiagAPI } from './diag/index.js'
import { FilesAPI } from './files/index.js'
import { KeyAPI } from './key/index.js'
import { LogAPI } from './log/index.js'
import { NameAPI } from './name/index.js'
import { ObjectAPI } from './object/index.js'
import { PinAPI } from './pin/index.js'
import { PubsubAPI } from './pubsub/index.js'
import { createRefs } from './refs/index.js'
import { RepoAPI } from './repo/index.js'
import { StatsAPI } from './stats/index.js'
import { SwarmAPI } from './swarm/index.js'

import { createAdd } from './add.js'
import { createAddAll } from './add-all.js'
import { createCat } from './cat.js'
import { createCommands } from './commands.js'
import { createDns } from './dns.js'
import { createGetEndpointConfig } from './get-endpoint-config.js'
import { createGet } from './get.js'
import { createId } from './id.js'
import { createIsOnline } from './is-online.js'
import { createLs } from './ls.js'
import { createMount } from './mount.js'
import { createPing } from './ping.js'
import { createResolve } from './resolve.js'
import { createStart } from './start.js'
import { createStop } from './stop.js'
import { createVersion } from './version.js'

/**
 * @typedef {import('./types').EndpointConfig} EndpointConfig
 * @typedef {import('./types').Options} Options
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 * @typedef {import('./types').IPFSHTTPClient} IPFSHTTPClient
 */

/**
 * @param {Options} options
 */
export function create (options = {}) {
  /**
   * @type {BlockCodec}
   */
  const id = {
    name: identity.name,
    code: identity.code,
    encode: (id) => id,
    decode: (id) => id
  }

  /** @type {MultibaseCodec[]} */
  const multibaseCodecs = Object.values(bases);

  (options.ipld && options.ipld.bases ? options.ipld.bases : []).forEach(base => multibaseCodecs.push(base))

  const multibases = new Multibases({
    bases: multibaseCodecs,
    loadBase: options.ipld && options.ipld.loadBase
  })

  /** @type {BlockCodec[]} */
  const blockCodecs = Object.values(codecs);

  [dagPB, dagCBOR, id].concat((options.ipld && options.ipld.codecs) || []).forEach(codec => blockCodecs.push(codec))

  const multicodecs = new Multicodecs({
    codecs: blockCodecs,
    loadCodec: options.ipld && options.ipld.loadCodec
  })

  /** @type {MultihashHasher[]} */
  const multihashHashers = Object.values(hashes);

  (options.ipld && options.ipld.hashers ? options.ipld.hashers : []).forEach(hasher => multihashHashers.push(hasher))

  const multihashes = new Multihashes({
    hashers: multihashHashers,
    loadHasher: options.ipld && options.ipld.loadHasher
  })

  /** @type {IPFSHTTPClient} */
  const client = {
    add: createAdd(options),
    addAll: createAddAll(options),
    bitswap: new BitswapAPI(options),
    block: new BlockAPI(options),
    bootstrap: new BootstrapAPI(options),
    cat: createCat(options),
    commands: createCommands(options),
    config: new ConfigAPI(options),
    dag: new DAGAPI(multicodecs, options),
    dht: new DHTAPI(options),
    diag: new DiagAPI(options),
    dns: createDns(options),
    files: new FilesAPI(options),
    get: createGet(options),
    getEndpointConfig: createGetEndpointConfig(options),
    id: createId(options),
    isOnline: createIsOnline(options),
    key: new KeyAPI(options),
    log: new LogAPI(options),
    ls: createLs(options),
    mount: createMount(options),
    name: new NameAPI(options),
    object: new ObjectAPI(multicodecs, options),
    pin: new PinAPI(options),
    ping: createPing(options),
    pubsub: new PubsubAPI(options),
    refs: createRefs(options),
    repo: new RepoAPI(options),
    resolve: createResolve(options),
    start: createStart(options),
    stats: new StatsAPI(options),
    stop: createStop(options),
    swarm: new SwarmAPI(options),
    version: createVersion(options),
    bases: multibases,
    codecs: multicodecs,
    hashers: multihashes
  }

  return client
}

export { CID } from 'multiformats/cid'
export { Multiaddr } from 'multiaddr'
export { default as globSource } from 'ipfs-utils/src/files/glob-source.js'
export { default as urlSource } from 'ipfs-utils/src/files/url-source.js'
