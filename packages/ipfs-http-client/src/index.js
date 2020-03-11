'use strict'
/* eslint-env browser */
const { Buffer } = require('buffer')
const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const toUri = require('multiaddr-to-uri')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { URL } = require('iso-url')
const API = require('./lib/api')

const isMultiaddr = (input) => {
  try {
    multiaddr(input) // eslint-disable-line no-new
    return true
  } catch (e) {
    return false
  }
}

const normalizeURL = (config) => {
  let api
  if (typeof config === 'string') {
    api = config
  }

  if (multiaddr.isMultiaddr(config) || isMultiaddr(config)) {
    api = toUri(config)
  }

  const url = new URL(api)
  if (config.apiPath) {
    url.pathname = config.apiPath
  } else if (url.pathname === '/' || url.pathname === undefined) {
    url.pathname = 'api/v0'
  }

  if (!api) {
    if (isBrowser || isWebWorker) {
      url.protocol = config.protocol || location.protocol
      url.hostname = config.host || location.hostname
      url.port = config.port || location.port
    } else {
      url.hostname = config.host || 'localhost'
      url.port = config.port || '5001'
      url.protocol = config.protocol || 'http'
    }
  }

  return url
}

const errorHandler = async (response) => {
  let msg

  try {
    if ((response.headers.get('Content-Type') || '').startsWith('application/json')) {
      const data = await response.json()
      // log(data)
      msg = data.Message || data.message
    } else {
      msg = await response.text()
    }
  } catch (err) {
    // log('Failed to parse error response', err)
    // Failed to extract/parse error message from response
    msg = err.message
  }

  const error = new API.HTTPError(response)

  // If we managed to extract a message from the response, use it
  if (msg) {
    error.message = msg
  }

  throw error
}

var KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g
function kebabCase (str) {
  return str.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase()
  })
}

function ipfsClient (config = {}) {
  const api = new API({
    timeout: config.timeout || 60000 * 20,
    signal: config.signal,
    headers: config.headers,
    base: normalizeURL(config).toString(),
    handleError: errorHandler,
    // apply two mutations camelCase to kebad-case and remove undefined/null key/value pairs
    // everything else either is a bug or validation is needed
    transformSearchParams: (search) => {
      const out = new URLSearchParams()

      // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
      for (const [key, value] of search) {
        if (
          value !== 'undefined' &&
          value !== 'null' &&
          key !== 'signal' &&
          key !== 'timeout'
        ) {
          out.append(kebabCase(key), value)
        }
      }

      // console.log('ipfsClient -> out', out)
      return out
    }
  })
  return {
    add: require('./add')(api),
    bitswap: require('./bitswap')(api),
    block: require('./block')(api),
    bootstrap: require('./bootstrap')(api),
    cat: require('./cat')(api),
    commands: require('./commands')(api),
    config: require('./config')(api),
    dag: require('./dag')(api),
    dht: require('./dht')(api),
    diag: require('./diag')(api),
    dns: require('./dns')(api),
    files: require('./files')(api),
    get: require('./get')(api),
    getEndpointConfig: require('./get-endpoint-config')(api),
    id: require('./id')(api),
    key: require('./key')(api),
    log: require('./log')(api),
    ls: require('./ls')(api),
    mount: require('./mount')(api),
    name: require('./name')(api),
    object: require('./object')(api),
    pin: require('./pin')(api),
    ping: require('./ping')(api),
    pubsub: require('./pubsub')(api),
    refs: require('./refs')(api),
    repo: require('./repo')(api),
    resolve: require('./resolve')(api),
    stats: require('./stats')(api),
    stop: require('./stop')(api),
    shutdown: require('./stop')(api),
    swarm: require('./swarm')(api),
    version: require('./version')(api)
  }
}

Object.assign(ipfsClient, { Buffer, CID, multiaddr, multibase, multicodec, multihash, globSource, urlSource })

module.exports = ipfsClient
