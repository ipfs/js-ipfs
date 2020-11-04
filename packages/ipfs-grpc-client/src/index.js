'use strict'

const transport = require('./grpc/transport')
const toUrlString = require('ipfs-core-utils/src/to-url-string')
const loadServices = require('./utils/load-services')
const { grpc } = require('@improbable-eng/grpc-web')
grpc.setDefaultTransport(transport())

const service = loadServices()

const protocols = {
  'ws://': 'http://',
  'wss://': 'https://'
}

module.exports = function createClient (opts = {}) {
  opts = opts || {}
  opts.url = toUrlString(opts.url)

  // @improbable-eng/grpc-web requires http:// protocol URLs, not ws://
  Object.keys(protocols).forEach(protocol => {
    if (opts.url.startsWith(protocol)) {
      opts.url = protocols[protocol] + opts.url.substring(protocol.length)
    }
  })

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
