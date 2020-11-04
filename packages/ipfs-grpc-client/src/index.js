'use strict'

const { grpc } = require('@improbable-eng/grpc-web')
const transport = require('./grpc/transport')
const toUrlString = require('ipfs-core-utils/src/to-url-string')

grpc.setDefaultTransport(transport())

const protocols = {
  'ws://': 'http://',
  'wss://': 'https://'
}

module.exports = function createClient (opts = {}) {
  opts = opts || {}
  opts.url = toUrlString(opts.url)

  Object.keys(protocols).forEach(protocol => {
    if (opts.url.startsWith(protocol)) {
      opts.url = protocols[protocol] + opts.url.substring(protocol.length)
    }
  })

  const client = {
    addAll: require('./core-api/add-all')(grpc, opts),
    id: require('./core-api/id')(grpc, opts)
  }

  return client
}
