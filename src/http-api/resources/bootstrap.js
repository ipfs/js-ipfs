'use strict'

const boom = require('boom')

exports = module.exports

exports.list = (request, reply) => {
  request.server.app.ipfs.bootstrap.list((err, list) => {
    if (err) {
      return reply(boom.badRequest(err))
    }
    return reply(list)
  })
}

exports.add = (request, reply) => {
//  request.server.app.ipfs.id((err, id) => {
//    if (err) { return reply(boom.badRequest(err)) }
//    return reply(id)
//   })
}

exports.rm = (request, reply) => {
//  request.server.app.ipfs.id((err, id) => {
//    if (err) { return reply(boom.badRequest(err)) }
//    return reply(id)
//   })
}
