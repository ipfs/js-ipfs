const ipfs = require('./../index.js').ipfs
const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  ipfs.id((err, id) => {
    if (err) { return reply(boom.badRequest(err)) }
    return reply(id)
  })
}
