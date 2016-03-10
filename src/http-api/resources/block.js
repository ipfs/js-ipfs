'use strict'

const ipfs = require('./../index.js').ipfs
// const debug = require('debug')
// const get = require('lodash.get')
// const set = require('lodash.set')
// const log = debug('http-api:config')
// log.error = debug('http-api:config:error')
// const multipart = require('ipfs-multipart')

exports = module.exports

exports.get = (request, reply) => {
  ipfs.block.get((multihash, callback) => {
    // parseargs to make sure it is a Multihash
    return reply(callback)
  })
}

exports.put = (request, reply) => {
  ipfs.block.put((multihash, callback) => {
    // parseArgs to make sure it is a block
    return reply(callback)
  })
}

exports.del = (request, reply) => {
  ipfs.block.del((multihash, callback) => {
    // parseargs to make sure it is a Multihash
    return reply(callback)
  })
}

exports.stat = (request, reply) => {
  ipfs.block.stat((multihash, callback) => {
    // parseargs to make sure it is a Multihash
    return reply(callback)
  })
}
