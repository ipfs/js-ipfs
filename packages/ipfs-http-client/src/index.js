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

  url.pathname = config.apiPath || 'api/v0'
  if (!api) {
    if (isBrowser || isWebWorker) {
      url.protocol = config.protocol || location.protocol
      url.host = config.host || location.hostname
      url.port = config.port || location.port
    } else {
      url.host = config.host || 'localhost'
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

function ipfsClient (config) {
  const api = new API({
    timeout: config.timeout || 60000 * 20,
    signal: config.signal,
    headers: config.headers,
    base: normalizeURL(config).toString(),
    handleError: errorHandler,
    // apply two mutations camelCase to kebad-case and remove undefined/null key/value pairs
    // everything else either is a bug or validation is needed
    transformSearchParams: (obj) => {
      const out = {}

      for (const [key, value] of obj) {
        if (
          value !== 'undefined' &&
          value !== 'null' &&
          key !== 'signal' &&
          key !== 'timeout'
        ) {
          out[kebabCase(key)] = value
        }
      }

      return out
    }
  })
  // console.log('ipfsClient -> api', api)
  return {
    add: require('./add')(api),
    bitswap: require('./bitswap')(config),
    block: require('./block')(config),
    bootstrap: require('./bootstrap')(config),
    cat: require('./cat')(api),
    commands: require('./commands')(config),
    config: require('./config')(config),
    dag: require('./dag')(config),
    dht: require('./dht')(config),
    diag: require('./diag')(config),
    dns: require('./dns')(config),
    files: require('./files')(config),
    get: require('./get')(config),
    getEndpointConfig: require('./get-endpoint-config')(config),
    id: require('./id')(config),
    key: require('./key')(config),
    log: require('./log')(config),
    ls: require('./ls')(config),
    mount: require('./mount')(config),
    name: require('./name')(config),
    object: require('./object')(config),
    pin: require('./pin')(config),
    ping: require('./ping')(config),
    pubsub: require('./pubsub')(config),
    refs: require('./refs')(config),
    repo: require('./repo')(config),
    resolve: require('./resolve')(config),
    stats: require('./stats')(config),
    stop: require('./stop')(config),
    shutdown: require('./stop')(config),
    swarm: require('./swarm')(config),
    version: require('./version')(config)
  }
}

Object.assign(ipfsClient, { Buffer, CID, multiaddr, multibase, multicodec, multihash, globSource, urlSource })

module.exports = ipfsClient
