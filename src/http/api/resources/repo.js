'use strict'

const Joi = require('@hapi/joi')

exports.gc = {
  validate: {
    query: Joi.object().keys({
      'stream-errors': Joi.boolean().default(false)
    }).unknown()
  },

  async handler (request, h) {
    const streamErrors = request.query['stream-errors']
    const { ipfs } = request.server.app
    const res = await ipfs.repo.gc()

    const filtered = res.filter(r => !r.err || streamErrors)
    const response = filtered.map(r => {
      return {
        Err: r.err && r.err.message,
        Key: !r.err && { '/': r.cid.toString() }
      }
    })
    return h.response(response)
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
