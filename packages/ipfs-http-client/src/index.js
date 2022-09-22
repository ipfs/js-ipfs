/* eslint-env browser */

import { Multibases } from 'ipfs-core-utils/multibases'
import { Multicodecs } from 'ipfs-core-utils/multicodecs'
import { Multihashes } from 'ipfs-core-utils/multihashes'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as dagJOSE from 'dag-jose'
import { identity } from 'multiformats/hashes/identity'
import { bases, hashes, codecs } from 'multiformats/basics'
import { createBitswap } from './bitswap/index.js'
import { createBlock } from './block/index.js'
import { createBootstrap } from './bootstrap/index.js'
import { createConfig } from './config/index.js'
import { createDag } from './dag/index.js'
import { createDht } from './dht/index.js'
import { createDiag } from './diag/index.js'
import { createFiles } from './files/index.js'
import { createKey } from './key/index.js'
import { createLog } from './log/index.js'
import { createName } from './name/index.js'
import { createObject } from './object/index.js'
import { createPin } from './pin/index.js'
import { createPubsub } from './pubsub/index.js'
import { createRefs } from './refs/index.js'
import { createRepo } from './repo/index.js'
import { createStats } from './stats/index.js'
import { createSwarm } from './swarm/index.js'
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
import globSourceImport from 'ipfs-utils/src/files/glob-source.js'

/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').LoadBaseFn} LoadBaseFn
 * @typedef {import('./types').LoadCodecFn} LoadCodecFn
 * @typedef {import('./types').LoadHasherFn} LoadHasherFn
 * @typedef {import('./types').IPLDOptions} IPLDOptions
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('./types').EndpointConfig} EndpointConfig
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

  [dagPB, dagCBOR, dagJSON, dagJOSE, id].concat((options.ipld && options.ipld.codecs) || []).forEach(codec => blockCodecs.push(codec))

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
    bitswap: createBitswap(options),
    block: createBlock(options),
    bootstrap: createBootstrap(options),
    cat: createCat(options),
    commands: createCommands(options),
    config: createConfig(options),
    dag: createDag(multicodecs, options),
    dht: createDht(options),
    diag: createDiag(options),
    dns: createDns(options),
    files: createFiles(options),
    get: createGet(options),
    getEndpointConfig: createGetEndpointConfig(options),
    id: createId(options),
    isOnline: createIsOnline(options),
    key: createKey(options),
    log: createLog(options),
    ls: createLs(options),
    mount: createMount(options),
    name: createName(options),
    object: createObject(multicodecs, options),
    pin: createPin(options),
    ping: createPing(options),
    pubsub: createPubsub(options),
    refs: createRefs(options),
    repo: createRepo(options),
    resolve: createResolve(options),
    start: createStart(options),
    stats: createStats(options),
    stop: createStop(options),
    swarm: createSwarm(options),
    version: createVersion(options),
    bases: multibases,
    codecs: multicodecs,
    hashers: multihashes
  }

  return client
}

export { CID } from 'multiformats/cid'
export { multiaddr } from '@multiformats/multiaddr'
export { default as urlSource } from 'ipfs-utils/src/files/url-source.js'
export const globSource = globSourceImport
