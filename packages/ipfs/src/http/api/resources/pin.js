'use strict'

const multibase = require('multibase')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const { map, reduce } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const { cidToString } = require('../../../utils/cid')
const streamResponse = require('../../utils/stream-response')
const all = require('it-all')

function toPin (type, cid, comments) {
  const output = {
    Type: type
  }

  if (cid) {
    output.Cid = cid
  }

  if (comments) {
    output.Comments = comments
  }

  return output
}

function parseArgs (request, h) {
  let { arg, comments, recursive } = request.query

  if (!arg) {
    throw Boom.badRequest("Argument 'arg' is required")
  }

  arg = Array.isArray(arg) ? arg : [arg]

  return arg.map(arg => {
    return {
      path: arg,
      comments,
      recursive: Boolean(recursive !== 'false')
    }
  })
}

exports.ls = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names),
      stream: Joi.boolean().default(false)
    }).unknown()
  },

  parseArgs: (request) => {
    let { arg, type } = request.query

    if (arg) {
      arg = Array.isArray(arg) ? arg : [arg]
      arg = arg.map(arg => arg)
    }

    return {
      source: arg,
      type: type || 'all'
    }
  },

  async handler (request, h) {
    const { ipfs } = request.server.app
    const { source, type } = request.pre.args

    if (!request.query.stream) {
      const res = await pipe(
        ipfs.pin.ls(source, { type }),
        reduce((res, { type, cid, comments }) => {
          res.Keys[cidToString(cid, { base: request.query['cid-base'] })] = toPin(type, null, comments)
          return res
        }, { Keys: {} })
      )

      return h.response(res)
    }

    return streamResponse(request, h, () => pipe(
      ipfs.pin.ls(source, { type }),
      map(({ type, cid, comments }) => toPin(type, cidToString(cid, { base: request.query['cid-base'] }), comments)),
      ndjson.stringify
    ))
  }
}

exports.add = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  parseArgs,

  async handler (request, h) {
    const { ipfs } = request.server.app
    const source = request.pre.args

    let result
    try {
      result = await all(ipfs.pin.add(source))
    } catch (err) {
      if (err.message.includes('already pinned recursively')) {
        throw Boom.boomify(err, { statusCode: 400 })
      }
      throw Boom.boomify(err, { message: 'Failed to add pin' })
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.cid, { base: request.query['cid-base'] }))
    })
  }
}

exports.rm = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  parseArgs,

  async handler (request, h) {
    const { ipfs } = request.server.app
    const source = request.pre.args

    let result
    try {
      result = await all(ipfs.pin.rm(source))
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to remove pin' })
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.cid, { base: request.query['cid-base'] }))
    })
  }
}
