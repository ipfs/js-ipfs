'use strict'

const CID = require('cids')
const multihash = require('multihashes')
const codecs = require('multicodec/src/base-table.json')
const multipart = require('ipfs-multipart')
const Joi = require('@hapi/joi')
const multibase = require('multibase')
const Boom = require('@hapi/boom')
const { cidToString } = require('../../../utils/cid')
const debug = require('debug')
const all = require('it-all')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')
const log = debug('ipfs:http-api:block')
log.error = debug('ipfs:http-api:block:error')

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest("Argument 'key' is required")
  }

  try {
    return { key: new CID(request.query.arg) }
  } catch (err) {
    log.error(err)
    throw Boom.badRequest('Not a valid hash')
  }
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const key = request.pre.args.key

    let block
    try {
      block = await request.server.app.ipfs.block.get(key)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get block' })
    }

    if (!block) {
      throw Boom.notFound('Block was unwanted before it could be remotely retrieved')
    }

    return h.response(block.data).header('X-Stream-Output', '1')
  }
}
exports.put = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names),
      format: Joi.string().valid(...Object.keys(codecs)),
      mhtype: Joi.string().valid(...Object.keys(multihash.names)),
      mhlen: Joi.number().default(-1),
      pin: Joi.bool().default(false)
    }).unknown()
  },

  // pre request handler that parses the args and returns `data` which is assigned to `request.pre.args`
  parseArgs: async (request, h) => {
    if (!request.payload) {
      throw Boom.badRequest("File argument 'data' is required")
    }

    let data

    for await (const part of multipart(request)) {
      if (part.type !== 'file') {
        continue
      }

      data = Buffer.concat(await all(part.content))
    }

    if (!data) {
      throw Boom.badRequest("File argument 'data' is required")
    }

    return { data }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { data } = request.pre.args
    const { ipfs } = request.server.app

    let block
    try {
      block = await ipfs.block.put(data, {
        mhtype: request.query.mhtype,
        format: request.query.format,
        version: request.query.version && parseInt(request.query.version)
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to put block' })
    }

    return h.response({
      Key: cidToString(block.cid, { base: request.query['cid-base'] }),
      Size: block.data.length
    })
  }
}

exports.rm = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.array().items(Joi.string()).single().required(),
      force: Joi.boolean().default(false),
      quiet: Joi.boolean().default(false),
      'stream-channels': Joi.boolean().default(true)
    }).unknown()
  },

  parseArgs: (request, h) => {
    let { arg } = request.query

    try {
      arg = arg.map(thing => new CID(thing))
    } catch (err) {
      throw Boom.badRequest('Not a valid hash')
    }

    return {
      ...request.query,
      arg
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler (request, h) {
    const { arg, force, quiet } = request.pre.args
    const { ipfs } = request.server.app

    return streamResponse(request, h, () => pipe(
      ipfs.block.rm(arg, { force, quiet }),
      map(({ cid, error }) => ({ Hash: cid.toString(), Error: error ? error.message : undefined })),
      ndjson.stringify
    ))
  }
}

exports.stat = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string(),
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { key } = request.pre.args

    let stats
    try {
      stats = await request.server.app.ipfs.block.stat(key)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get block stats' })
    }

    return h.response({
      Key: cidToString(stats.cid, { base: request.query['cid-base'] }),
      Size: stats.size
    })
  }
}
