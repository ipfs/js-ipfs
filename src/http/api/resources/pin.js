'use strict'

const _ = require('lodash')
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
    ipfs.pin.ls(path, { type }, (err, result) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to list pins: ${err.message}`,
          Code: 0
        }).code(500)
      }

      return reply({
        Keys: _.mapValues(
          _.keyBy(result, obj => obj.hash),
          obj => ({Type: obj.type})
        )
      })
    })
  }
}

exports.add = {
  parseArgs: parseArgs,

  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { path, recursive } = request.pre.args
    ipfs.pin.add(path, { recursive }, (err, result) => {
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
  parseArgs: parseArgs,

  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { path, recursive } = request.pre.args
    ipfs.pin.rm(path, { recursive }, (err, result) => {
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
