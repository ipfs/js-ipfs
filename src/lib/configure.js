'use strict'
/* eslint-env browser */

const ky = require('ky-universal').default
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { toUri } = require('./multiaddr')
const errorHandler = require('./error-handler')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

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
  config.apiPath = config.apiPath || config['api-path'] || '/api/v0'

  // TODO configure ky to use config.fetch when this is released:
  // https://github.com/sindresorhus/ky/pull/153
  const defaults = {
    prefixUrl: config.apiAddr + config.apiPath,
    timeout: config.timeout || 60000 * 20,
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
    if (!protocol && !host && !port) { // Use current origin
      return ''
    }

    if (!protocol) {
      protocol = location.protocol.startsWith('http')
        ? location.protocol.split(':')[0]
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
    return fn(input, mergeOptions(defaults, options))
  }
}
