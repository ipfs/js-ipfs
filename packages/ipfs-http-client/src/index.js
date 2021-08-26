'use strict'
/* eslint-env browser */

const { CID } = require('multiformats/cid')
const { multiaddr } = require('multiaddr')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const Multicodecs = require('ipfs-core-utils/src/multicodecs')
const Multihashes = require('ipfs-core-utils/src/multihashes')
const Multibases = require('ipfs-core-utils/src/multibases')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const { identity } = require('multiformats/hashes/identity')
const { bases, hashes, codecs } = require('multiformats/basics')

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
function create (options = {}) {
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

  [dagPb, dagCbor, id].concat((options.ipld && options.ipld.codecs) || []).forEach(codec => blockCodecs.push(codec))

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
    add: require('./add')(options),
    addAll: require('./add-all')(options),
    bitswap: require('./bitswap')(options),
    block: require('./block')(options),
    bootstrap: require('./bootstrap')(options),
    cat: require('./cat')(options),
    commands: require('./commands')(options),
    config: require('./config')(options),
    dag: require('./dag')(multicodecs, options),
    dht: require('./dht')(options),
    diag: require('./diag')(options),
    dns: require('./dns')(options),
    files: require('./files')(options),
    get: require('./get')(options),
    getEndpointConfig: require('./get-endpoint-config')(options),
    id: require('./id')(options),
    isOnline: require('./is-online')(options),
    key: require('./key')(options),
    log: require('./log')(options),
    ls: require('./ls')(options),
    mount: require('./mount')(options),
    name: require('./name')(options),
    object: require('./object')(multicodecs, options),
    pin: require('./pin')(options),
    ping: require('./ping')(options),
    pubsub: require('./pubsub')(options),
    refs: require('./refs')(options),
    repo: require('./repo')(options),
    resolve: require('./resolve')(options),
    start: require('./start')(options),
    stats: require('./stats')(options),
    stop: require('./stop')(options),
    swarm: require('./swarm')(options),
    version: require('./version')(options),
    bases: multibases,
    codecs: multicodecs,
    hashers: multihashes
  }

  return client
}

module.exports = {
  create,
  CID,
  multiaddr,
  globSource,
  urlSource
}
