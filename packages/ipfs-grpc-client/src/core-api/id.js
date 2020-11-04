'use strict'

const { IdRequest } = require('ipfs-grpc-protocol/dist/root_pb')
const { Root } = require('ipfs-grpc-protocol/dist/root_pb_service')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toHeaders = require('../utils/to-headers')
const toPromise = require('../utils/unary-to-promise')

module.exports = function grpcId (grpc, opts = {}) {
  opts = opts || {}

  function id (source, options = {}) {
    const request = new IdRequest()

    return toPromise(grpc, Root.id, {
      request,
      host: opts.url,
      headers: toHeaders(options)
    })
  }

  return withTimeoutOption(id)
}
