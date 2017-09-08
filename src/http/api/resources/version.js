'use strict'

const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs.version((err, version) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    reply({
      Version: version.version,
      Commit: version.commit,
      Repo: version.repo
    })
  })
}
