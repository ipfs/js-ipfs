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
 * @param {import("./lib/core").ClientOptions} options
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

/**
 * @typedef {Object} HttpOptions
 * @property {Headers | Record<string, string>} [headers] - An object or [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance that can be used to set custom HTTP headers. Note that this option can also be [configured globally](#custom-headers) via the constructor options.
 * @property {URLSearchParams | Record<string, string>} [searchParams] - An object or [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) instance that can be used to add additional query parameters to the query string sent with each request.
 *
 * @typedef {import('ipfs-core/src/utils').AbortOptions} AbortOptions}
 */

/**
 * This is an utility type that can be used to derive type of the HTTP Client
 * API from the Core API. It takes type of the API factory (from ipfs-core),
 * derives API from it's return type and extends it last `options` parameter
 * with `HttpOptions`.
 *
 * This can be used to avoid (re)typing API interface when implementing it in
 * http client e.g you can annotate `ipfs.addAll` implementation with
 *
 * `@type {Implements<typeof import('ipfs-core/src/components/add-all')>}`
 *
 * **Caution**: This supports APIs with up to four parameters and last optional
 * `options` parameter, anything else will result to `never` type.
 *
 * @template {(config:any) => any} APIFactory
 * @typedef {APIWithExtraOptions<ReturnType<APIFactory>, HttpOptions>} Implements
 */

/**
 * @template Key
 * @template {(config:any) => any} APIFactory
 * @typedef {import('./interface').APIMethodWithExtraOptions<ReturnType<APIFactory>, Key, HttpOptions>} ImplementsMethod
 */

/**
 * @template API, Extra
 * @typedef {import('./interface').APIWithExtraOptions<API, Extra>} APIWithExtraOptions
 */
