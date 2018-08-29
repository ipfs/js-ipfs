'use strict'

const mapValues = require('lodash/mapValues')
const keyBy = require('lodash/keyBy')
const multibase = require('multibase')
const Joi = require('joi')
const debug = require('debug')
const log = debug('jsipfs:http-api:pin')
log.error = debug('jsipfs:http-api:pin:error')

exports = module.exports

function parseArgs (request, reply) {
  if (!request.query.arg) {
    return reply({
      Message: "Argument 'arg' is required",
      Code: 0
    }).code(400).takeover()
  }

  const recursive = request.query.recursive !== 'false'

  return reply({
    path: request.query.arg,
    recursive: recursive
  })
}

exports.ls = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  parseArgs: (request, reply) => {
    const type = request.query.type || 'all'

    return reply({
      path: request.query.arg,
      type: type
    })
  },

  handler: (request, reply) => {
    const { path, type } = request.pre.args
    const ipfs = request.server.app.ipfs
    const cidBase = request.query['cid-base']

    ipfs.pin.ls(path, { type, cidBase }, (err, result) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to list pins: ${err.message}`,
          Code: 0
        }).code(500)
      }

      return reply({
        Keys: mapValues(
          keyBy(result, obj => obj.hash),
          obj => ({ Type: obj.type })
        )
      })
    })
  }
}

exports.add = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  parseArgs: parseArgs,

  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { path, recursive } = request.pre.args
    const cidBase = request.query['cid-base']

    ipfs.pin.add(path, { recursive, cidBase }, (err, result) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to add pin: ${err.message}`,
          Code: 0
        }).code(500)
      }

      return reply({
        Pins: result.map(obj => obj.hash)
      })
    })
  }
}

exports.rm = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  parseArgs: parseArgs,

  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { path, recursive } = request.pre.args
    const cidBase = request.query['cid-base']

    ipfs.pin.rm(path, { recursive, cidBase }, (err, result) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to remove pin: ${err.message}`,
          Code: 0
        }).code(500)
      }

      return reply({
        Pins: result.map(obj => obj.hash)
      })
    })
  }
}
