const ipfs = require('./../index.js').ipfs
const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  ipfs.version((err, ipfsVersion) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    ipfs.repo.version((err, repoVersion) => {
      if (err) {
        return reply(boom.badRequest(err))
      }

      console.log('--------->')

      reply({
        Version: ipfsVersion,
        Commit: '',
        Repo: repoVersion
      }).header('Transfer-Encoding', 'chunked')
        // .header('Trailer', 'X-Stream-Error')
        .type('application/json')
    })
  })
}
