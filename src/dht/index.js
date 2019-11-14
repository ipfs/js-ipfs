'use strict'

const callbackify = require('callbackify')
const errCode = require('err-code')
const { collectify } = require('../lib/converters')

module.exports = config => {
  const get = require('./get')(config)
  const findPeer = require('./find-peer')(config)

  return {
    get: callbackify.variadic(async (key, options) => {
      for await (const value of get(key, options)) {
        return value
      }
      throw errCode(new Error('value not found'), 'ERR_TYPE_5_NOT_FOUND')
    }),
    put: callbackify.variadic(collectify(require('./put')(config))),
    findProvs: callbackify.variadic(collectify(require('./find-provs')(config))),
    findPeer: callbackify.variadic(async (peerId, options) => {
      for await (const peerInfo of findPeer(peerId, options)) {
        return peerInfo
      }
      throw errCode(new Error('final peer not found'), 'ERR_TYPE_2_NOT_FOUND')
    }),
    provide: callbackify.variadic(collectify(require('./provide')(config))),
    // find closest peerId to given peerId
    query: callbackify.variadic(collectify(require('./query')(config)))
  }
}
