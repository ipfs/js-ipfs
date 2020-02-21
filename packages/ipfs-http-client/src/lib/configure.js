'use strict'
/* eslint-env browser */

const ky = require('ky-universal').default
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const toUri = require('multiaddr-to-uri')
const errorHandler = require('./error-handler')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const parseDuration = require('parse-duration')

// Set default configuration and call create function with them
module.exports = create => config => {
  config = config || {}

  if (typeof config === 'string') {
    config = { apiAddr: config }
  } else if (config.constructor && config.constructor.isMultiaddr) {
    config = { apiAddr: config }
  } else {
    config = { ...config }
  }

  config.apiAddr = (config.apiAddr || getDefaultApiAddr(config)).toString()
  config.apiAddr = config.apiAddr.startsWith('/') ? toUri(config.apiAddr) : config.apiAddr
  config.apiAddr = trimEnd(config.apiAddr, '/')

  const apiAddrPath = getNonRootPath(config.apiAddr)

  // Use configured apiPath, or path on the end of apiAddr (if there is one) or default to /api/v0
  config.apiPath = config.apiPath || config['api-path'] || apiAddrPath || '/api/v0'
  config.apiPath = trimEnd(config.apiPath, '/')

  // If user passed apiAddr with a path, trim it from the end (it is now apiPath)
  config.apiAddr = apiAddrPath ? trimEnd(config.apiAddr, apiAddrPath) : config.apiAddr

  const defaults = {
    prefixUrl: config.apiAddr + config.apiPath,
    timeout: parseTimeout(config.timeout) || 60000 * 20,
    headers: config.headers,
    hooks: {
      afterResponse: [errorHandler]
    }
  }
  const k = ky.extend(defaults)
  const client = ['get', 'post', 'put', 'delete', 'patch', 'head']
    .reduce((client, key) => {
      client[key] = wrap(k[key], defaults)

      return client
    }, wrap(k, defaults))

  return create({
    ky: client,
    ...config
  })
}

function getDefaultApiAddr ({ protocol, host, port }) {
  if (isBrowser || isWebWorker) {
    if (!protocol) {
      protocol = location.protocol.startsWith('http')
        ? trimEnd(location.protocol, ':')
        : 'http'
    }

    host = host || location.hostname
    port = port || location.port

    return `${protocol}://${host}${port ? ':' + port : ''}`
  }

  return `${protocol || 'http'}://${host || 'localhost'}:${port || 5001}`
}

// returns the passed function wrapped in a function that ignores
// undefined values in the passed `options` object
function wrap (fn, defaults) {
  return (input, options) => {
    if (options.timeout) options.timeout = parseTimeout(options.timeout)
    return fn(input, mergeOptions(defaults, options))
  }
}

function parseTimeout (value) {
  return typeof value === 'string' ? parseDuration(value) : value
}

const trimEnd = (str, end) => str.endsWith(end) ? str.slice(0, -end.length) : str

// Get the path from a URL is it is not /
function getNonRootPath (url) {
  if (url) {
    const { pathname } = new URL(url)
    return pathname === '/' ? null : pathname
  }
}
