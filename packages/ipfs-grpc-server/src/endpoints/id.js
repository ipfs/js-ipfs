'use strict'

const { callbackify } = require('util')

module.exports = function grpcId (ipfs, options = {}) {
  function id (request, metadata) {
    const opts = {
      ...request,
      ...metadata
    }

    return ipfs.id(opts)
  }

  return callbackify(id)
}
