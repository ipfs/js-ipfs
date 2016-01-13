'use strict'

const ipfs = require('./../index.js').ipfs
const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  ipfs.version((err, version) => {
    if (err) { return reply(boom.badRequest(err)) }
    return reply(version)
  })
}
