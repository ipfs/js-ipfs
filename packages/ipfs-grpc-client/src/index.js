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
 * @param {object} opts
 * @param {string} opts.url - The URL to connect to as a URL or Multiaddr
 * @property {Agent | function(string):Agent} [agent] - A [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) or a function that returns an agent, used to control connection persistence and reuse for HTTP clients (only supported in node.js)
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
