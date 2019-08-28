'use strict'
/* eslint-env browser */

const ky = require('ky-universal').default
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { toUri } = require('./multiaddr')
const errorHandler = require('./error-handler')

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

  return create({
    // TODO configure ky to use config.fetch when this is released:
    // https://github.com/sindresorhus/ky/pull/153
    ky: ky.extend({
      prefixUrl: config.apiAddr + config.apiPath,
      timeout: config.timeout || 60 * 1000,
      headers: config.headers,
      hooks: {
        afterResponse: [errorHandler]
      }
    }),
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
