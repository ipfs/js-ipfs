'use strict'

const Joi = require('joi')

exports.gc = {
  validate: {
    query: Joi.object().keys({
      quiet: Joi.boolean().default(false),
      'stream-errors': Joi.boolean().default(false)
    }).unknown()
  },

  async handler (request, h) {
    const quiet = request.query.quiet
    const streamErrors = request.query['stream-errors']
    const { ipfs } = request.server.app
    const res = await ipfs.repo.gc({ quiet, streamErrors })
    return h.response(res.map(r => ({ Err: r.err, Key: { '/': r.cid } })))
  }
}

exports.version = async (request, h) => {
  const { ipfs } = request.server.app
  const version = await ipfs.repo.version()
  return h.response({
    Version: version
  })
}

exports.stat = async (request, h) => {
  const { ipfs } = request.server.app
  const human = request.query.human === 'true'
  const stat = await ipfs.repo.stat({ human })

  return h.response({
    NumObjects: stat.numObjects,
    RepoSize: stat.repoSize,
    RepoPath: stat.repoPath,
    Version: stat.version,
    StorageMax: stat.storageMax
  })
}
