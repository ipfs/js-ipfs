'use strict'

const _ = require('lodash')
const debug = require('debug')
const log = debug('jsipfs:http-api:pin')
log.error = debug('jsipfs:http-api:pin:error')

exports = module.exports

exports.ls = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const types = ipfs.pin.types
  const path = request.query.arg
  const type = request.query.type || types.all
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

exports.add = {
  // main route handler which is called after `parseArgs`,
  // but only if the args were valid
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const path = request.query.arg
    const recursive = request.query.recursive !== 'false'
    const onError = (err, code) => {
      log.error(err)
      return reply({
        Message: `Failed to add pin: ${err.message}`,
        Code: 0
      }).code(code)
    }
    if (!path) {
      return onError(new Error("Argument 'ipfs-path' is required"), 400)
    }
    ipfs.pin.add(path, { recursive }, (err, result) => {
      if (err) { return onError(err, 500) }
      return reply({
        Pins: result.map(obj => obj.hash)
      })
    })
  }
}

exports.rm = {
  // main route handler which is called after `parseArgs`,
  // but only if the args were valid
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const path = request.query.arg
    const recursive = request.query.recursive !== 'false'
    const onError = (err, code) => {
      log.error(err)
      return reply({
        Message: `Failed to remove pin: ${err.message}`,
        Code: 0
      }).code(code)
    }
    if (!path) {
      return onError(new Error("Argument 'ipfs-path' is required"), 400)
    }
    ipfs.pin.rm(path, { recursive }, (err, result) => {
      if (err) { return onError(err, 500) }
      return reply({
        Pins: result.map(obj => obj.hash)
      })
    })
  }
}
