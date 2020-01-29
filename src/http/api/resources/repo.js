'use strict'

const Joi = require('@hapi/joi')
const { map, filter } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

exports.gc = {
  validate: {
    query: Joi.object().keys({
      'stream-errors': Joi.boolean().default(false)
    }).unknown()
  },

  handler (request, h) {
    const streamErrors = request.query['stream-errors']
    const { ipfs } = request.server.app

    return streamResponse(request, h, () => pipe(
      ipfs.repo.gc(),
      filter(r => !r.err || streamErrors),
      map(r => ({
        Error: r.err && r.err.message,
        Key: !r.err && { '/': r.cid.toString() }
      })),
      ndjson.stringify
    ))
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
  const stat = await ipfs.repo.stat()

  return h.response({
    NumObjects: stat.numObjects,
    RepoSize: stat.repoSize,
    RepoPath: stat.repoPath,
    Version: stat.version,
    StorageMax: stat.storageMax
  })
}
