'use strict'

const multibase = require('multibase')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const isIpfs = require('is-ipfs')
const { cidToString } = require('../../../utils/cid')

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
      'cid-base': Joi.string().valid(...multibase.names)
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

    let result
    try {
      result = await ipfs.pin.ls(path, { type })
    } catch (err) {
      throw Boom.boomify(err)
    }

    return h.response({
      Keys: result.reduce((acc, v) => {
        const prop = cidToString(v.hash, { base: request.query['cid-base'] })
        acc[prop] = { Type: v.type }
        return acc
      }, {})
    })
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
      Pins: result.map(obj => cidToString(obj.hash, { base: request.query['cid-base'] }))
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
      Pins: result.map(obj => cidToString(obj.hash, { base: request.query['cid-base'] }))
    })
  }
}
