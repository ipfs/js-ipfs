'use strict'

const toUrlString = require('ipfs-core-utils/src/to-url-string')
const loadServices = require('./utils/load-services')
const { grpc } = require('@improbable-eng/grpc-web')

/**
 * @typedef {import('./types').Options} Options
 */

const service = loadServices()

/** @type {Record<string, string>} */
const protocols = {
  'ws://': 'http://',
  'wss://': 'https://'
}

/**
 * @param {{ url: string }} opts
 */
function normaliseUrls (opts) {
  Object.keys(protocols).forEach(protocol => {
    if (opts.url.startsWith(protocol)) {
      opts.url = protocols[protocol] + opts.url.substring(protocol.length)
    }
  })
}

/**
 * @param {Options} [opts]
 */
function create (opts = { url: '' }) {
  const options = {
    ...opts,
    url: toUrlString(opts.url)
  }

  // @improbable-eng/grpc-web requires http:// protocol URLs, not ws://
  normaliseUrls(options)

  const client = {
    // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
    addAll: require('./core-api/add-all')(grpc, service.Root.add, options),
    // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
    id: require('./core-api/id')(grpc, service.Root.id, options),
    files: {
      // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
      ls: require('./core-api/files/ls')(grpc, service.MFS.ls, options),
      // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
      write: require('./core-api/files/write')(grpc, service.MFS.write, options)
    }
  }

  return client
}

module.exports = {
  create
}
