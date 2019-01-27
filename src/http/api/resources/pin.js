'use strict'

const mapValues = require('lodash/mapValues')
const keyBy = require('lodash/keyBy')
const multibase = require('multibase')
const Joi = require('joi')
const Boom = require('boom')
const isIpfs = require('is-ipfs')
const { cidToString } = require('../../../utils/cid')
const debug = require('debug')
const log = debug('jsipfs:http-api:pin')
log.error = debug('jsipfs:http-api:pin:error')

exports = module.exports

function parseArgs (request, h) {
  const { arg } = request.query

  if (!arg) {
    throw Boom.badRequest("Argument 'arg' is required")
  }

  if (!isIpfs.ipfsPath(arg) && !isIpfs.cid(arg)) {
    throw Boom.badRequest('invalid ipfs ref path')
  }

  const recursive = request.query.recursive !== 'false'
  return { path: request.query.arg, recursive }
}

exports.ls = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  parseArgs (request, h) {
    const { arg } = request.query

    if (arg && !isIpfs.ipfsPath(arg) && !isIpfs.cid(arg)) {
      throw Boom.badRequest('invalid ipfs ref path')
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
      log.error(err)
      throw new Error(`Failed to list pins: ${err.message}`)
    }

    return h.response({
      Keys: mapValues(
        keyBy(result, obj => cidToString(obj.hash, { base: request.query['cid-base'] })),
        obj => ({ Type: obj.type })
      )
    })
  }
}

exports.add = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
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
      log.error(err)
      if (err.message.includes('already pinned recursively')) {
        throw Boom.boomify(err, { statusCode: 400 })
      }
      throw new Error(`Failed to add pin: ${err.message}`)
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.hash, { base: request.query['cid-base'] }))
    })
  }
}

exports.rm = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
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
      log.error(err)
      throw new Error(`Failed to remove pin: ${err.message}`)
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.hash, { base: request.query['cid-base'] }))
    })
  }
}
