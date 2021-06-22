'use strict'
/* eslint-env browser */

const CID = require('cids')
const { multiaddr } = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')

/**
 * @typedef {import('./types').EndpointConfig} EndpointConfig
 * @typedef {import('./types').Options} Options
 */

/**
 * @param {Options} options
 */
function create (options = {}) {
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
    dag: require('./dag')(options),
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
    object: require('./object')(options),
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
    version: require('./version')(options)
  }

  return client
}

module.exports = {
  create,
  CID,
  multiaddr,
  multibase,
  multicodec,
  multihash,
  globSource,
  urlSource
}
