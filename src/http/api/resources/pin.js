'use strict'

const _ = require('lodash')
const debug = require('debug')
const log = debug('jsipfs:http-api:pin')
log.error = debug('jsipfs:http-api:pin:error')

exports = module.exports

function parseArgs (request, reply) {
  const query = request.query
  if (!query.arg) {
    return reply({
      Message: "Argument 'arg' is required",
      Code: 0
    }).code(400).takeover()
  }

  const recursive = query.recursive !== 'false'

  return reply({
    path: query.arg,
    recursive: recursive,
  })
}

exports.ls = {
  parseArgs: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const type = query.type || ipfs.pin.types.all

    return reply({
      path: query.arg,
      type: type
    })
  },

  handler: (request, reply) => {
    const { path, type } = request.args
    const ipfs = request.server.app.ipfs
    ipfs.pin.ls([path], { type }, (err, result) => {
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
    const { path, recursive } = request.args
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
    const { path, recursive } = request.args
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
