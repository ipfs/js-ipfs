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
const raw = require('multiformats/codecs/raw')
const json = require('multiformats/codecs/json')
const { sha256, sha512 } = require('multiformats/hashes/sha2')
const { identity } = require('multiformats/hashes/identity')
const { base58btc } = require('multiformats/bases/base58')

/**
 * @typedef {import('./types').EndpointConfig} EndpointConfig
 * @typedef {import('./types').Options} Options
 */

/**
 * @param {Options} options
 */
function create (options = {}) {
  const bases = new Multibases({
    bases: [base58btc].concat(options.ipld && options.ipld.bases ? options.ipld.bases : []),
    loadBase: options.ipld && options.ipld.loadBase ? options.ipld.loadBase : (prefixOrName) => Promise.reject(new Error(`No base found for "${prefixOrName}"`))
  })
  const codecs = new Multicodecs({
    codecs: [dagPb, dagCbor, raw, json].concat(options.ipld?.codecs || []),
    loadCodec: options.ipld && options.ipld.loadCodec ? options.ipld.loadCodec : (codeOrName) => Promise.reject(new Error(`No codec found for "${codeOrName}"`))
  })
  const hashers = new Multihashes({
    hashers: [sha256, sha512, identity].concat(options.ipld && options.ipld.hashers ? options.ipld.hashers : []),
    loadHasher: options.ipld && options.ipld.loadHasher ? options.ipld.loadHasher : (codeOrName) => Promise.reject(new Error(`No hasher found for "${codeOrName}"`))
  })

  /** @type {import('ipfs-core-types').IPFS & { getEndpointConfig: () => EndpointConfig }} */
  const client = {
    add: require('./add')(options),
    addAll: require('./add-all')(options),
    bitswap: require('./bitswap')(options),
    block: require('./block')(options),
    bootstrap: require('./bootstrap')(options),
    cat: require('./cat')(options),
    commands: require('./commands')(options),
    config: require('./config')(options),
    dag: require('./dag')(codecs, options),
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
    object: require('./object')(codecs, options),
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
    bases,
    codecs,
    hashers
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
