'use strict'

const { callbackify } = require('util')

/**
 * @typedef {import('ipfs-grpc-protocol/root_pb').IdRequest} IdRequest
 * @typedef {import('ipfs-grpc-protocol/root_pb').IdResponse} IdResponse
 * @typedef {import('@grpc/grpc-js').handleUnaryCall<IdRequest, IdResponse>} handleUnaryCall
 *
 * @returns {handleUnaryCall}
 */
module.exports = function grpcId (ipfs, options = {}) {
  function id (request, metadata) {
    const opts = {
      ...request,
      ...metadata
    }

    return ipfs.id(opts)
  }

  // @ts-ignore
  return callbackify(id)
}
