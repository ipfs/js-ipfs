'use strict'

const toUrlString = require('ipfs-core-utils/src/to-url-string')
const loadServices = require('./utils/load-services')
const { grpc } = require('@improbable-eng/grpc-web')

const service = loadServices()

const protocols = {
  'ws://': 'http://',
  'wss://': 'https://'
}

function normaliseUrls (opts) {
  Object.keys(protocols).forEach(protocol => {
    if (opts.url.startsWith(protocol)) {
      opts.url = protocols[protocol] + opts.url.substring(protocol.length)
    }
  })
}

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 *
 * @typedef {Object} Options
 * @property {string|URL|import('multiaddr')} url - The URL to connect to as a URL or Multiaddr
 * @property {HttpAgent|HttpsAgent} [agent] - http.Agent used to control HTTP client behaviour (node.js only)
 *
 * @param {Options} [opts]
 */
module.exports = function createClient (opts = { url: '' }) {
  opts.url = toUrlString(opts.url)

  // @improbable-eng/grpc-web requires http:// protocol URLs, not ws://
  normaliseUrls(opts)

  const client = {
    addAll: require('./core-api/add-all')(grpc, service.Root.add, opts),
    id: require('./core-api/id')(grpc, service.Root.id, opts),
    files: {
      ls: require('./core-api/files/ls')(grpc, service.MFS.ls, opts),
      write: require('./core-api/files/write')(grpc, service.MFS.write, opts)
    }
  }

  return client
}
