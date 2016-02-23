const ipfs = require('./../index.js').ipfs
const boom = require('boom')

exports = module.exports

exports.list = (request, reply) => {
  ipfs.bootstrap.list((err, list) => {
    if (err) {
      return reply(boom.badRequest(err))
    }
    return reply(list)
  })
}

exports.add = (request, reply) => {
//  ipfs.id((err, id) => {
//    if (err) { return reply(boom.badRequest(err)) }
//    return reply(id)
//   })
}

exports.rm = (request, reply) => {
//  ipfs.id((err, id) => {
//    if (err) { return reply(boom.badRequest(err)) }
//    return reply(id)
//   })
}
