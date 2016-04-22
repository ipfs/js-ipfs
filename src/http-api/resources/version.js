'use strict'

const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  request.server.app.ipfs.version((err, ipfsVersion) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    request.server.app.ipfs.repo.version((err, repoVersion) => {
      if (err) {
        return reply(boom.badRequest(err))
      }

      reply({
        Version: ipfsVersion,
        Commit: '',
        Repo: repoVersion
      })
    })
  })
}
