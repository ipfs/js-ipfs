'use strict'
/* eslint-env browser */

const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')

/**
 * @typedef { import("./lib/core").ClientOptions } ClientOptions
 */

/**
 * @typedef {object} HttpOptions
 * @property {Headers | Record<string, string>} [headers] - An object or [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance that can be used to set custom HTTP headers. Note that this option can also be [configured globally](#custom-headers) via the constructor options.
 * @property {URLSearchParams | Record<string, string>} [searchParams] - An object or [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) instance that can be used to add additional query parameters to the query string sent with each request.
 * @property {object} [ipld]
 * @property {any[]} [ipld.formats] - An array of additional [IPLD formats](https://github.com/ipld/interface-ipld-format) to support
 * @property {(format: string) => Promise<any>} [ipld.loadFormat] - an async function that takes the name of an [IPLD format](https://github.com/ipld/interface-ipld-format) as a string and should return the implementation of that codec
 */

// eslint-disable-next-line valid-jsdoc
/**
 * @param {ClientOptions} options
 */
function ipfsClient (options = {}) {
  return {
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
    stats: require('./stats')(options),
    stop: require('./stop')(options),
    shutdown: require('./stop')(options),
    swarm: require('./swarm')(options),
    version: require('./version')(options)
  }
}

Object.assign(ipfsClient, { CID, multiaddr, multibase, multicodec, multihash, globSource, urlSource })

module.exports = ipfsClient
