'use strict'

const multibase = require('multibase')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const isIpfs = require('is-ipfs')
const { map, reduce } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const { cidToString } = require('../../../utils/cid')
const streamResponse = require('../../utils/stream-response')

function parseArgs (request, h) {
  let { arg } = request.query

  if (!arg) {
    throw Boom.badRequest("Argument 'arg' is required")
  }

  arg = Array.isArray(arg) ? arg : [arg]

  arg.forEach(path => {
    if (!isIpfs.ipfsPath(path) && !isIpfs.cid(path)) {
      throw Boom.badRequest('invalid ipfs ref path')
    }
  })

  const recursive = request.query.recursive !== 'false'
  return { path: arg, recursive }
}

exports.ls = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names),
      stream: Joi.boolean().default(false)
    }).unknown()
  },

  parseArgs (request, h) {
    let { arg } = request.query

    if (arg) {
      arg = Array.isArray(arg) ? arg : [arg]

      arg.forEach(path => {
        if (!isIpfs.ipfsPath(path) && !isIpfs.cid(path)) {
          throw Boom.badRequest('invalid ipfs ref path')
        }
      })
    }

    const type = request.query.type || 'all'
    return { path: request.query.arg, type }
  },

  async handler (request, h) {
    const { ipfs } = request.server.app
    const { path, type } = request.pre.args

    if (!request.query.stream) {
      const res = await pipe(
        ipfs.pin.ls(path, { type }),
        reduce((res, { type, cid }) => {
          res.Keys[cidToString(cid, { base: request.query['cid-base'] })] = { Type: type }
          return res
        }, { Keys: {} })
      )

      return h.response(res)
    }

    return streamResponse(request, h, () => pipe(
      ipfs.pin.ls(path, { type }),
      map(({ type, cid }) => ({ Type: type, Cid: cidToString(cid, { base: request.query['cid-base'] }) })),
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
    const { path, recursive } = request.pre.args

    let result
    try {
      result = await ipfs.pin.add(path, { recursive })
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
    const { path, recursive } = request.pre.args

    let result
    try {
      result = await ipfs.pin.rm(path, { recursive })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to remove pin' })
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.cid, { base: request.query['cid-base'] }))
    })
  }
}
