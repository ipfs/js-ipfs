var ipfs = require('./../index.js').ipfs
var boom = require('boom')

exports = module.exports

exports.get = function handler (request, reply) {
  ipfs.version(function (err, version) {
    if (err) {
      return reply(boom.badRequest(err))
    }
    return reply(version)
  })
}

