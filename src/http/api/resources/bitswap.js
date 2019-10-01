'use strict'

const Joi = require('@hapi/joi')
const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const { parseKey } = require('./block')

exports.wantlist = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  async handler (request, h) {
    const { ipfs } = request.server.app
    const peerId = request.query.peer
    const cidBase = request.query['cid-base']

    const list = await ipfs.bitswap.wantlist(peerId)

    return h.response({
      Keys: list.Keys.map(k => ({
        '/': cidToString(k['/'], { base: cidBase, upgrade: false })
      }))
    })
  }
}

exports.stat = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  async handler (request, h) {
    const { ipfs } = request.server.app
    const cidBase = request.query['cid-base']

    const stats = await ipfs.bitswap.stat()

    stats.wantlist = stats.wantlist.map(k => ({
      '/': cidToString(k['/'], { base: cidBase, upgrade: false })
    }))

    return h.response({
      ProvideBufLen: stats.provideBufLen,
      BlocksReceived: stats.blocksReceived,
      Wantlist: stats.wantlist,
      Peers: stats.peers,
      DupBlksReceived: stats.dupBlksReceived,
      DupDataReceived: stats.dupDataReceived,
      DataReceived: stats.dataReceived,
      BlocksSent: stats.blocksSent,
      DataSent: stats.dataSent
    })
  }
}

exports.unwant = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that assigns a `key` to request.pre.args
  parseArgs: parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const key = request.pre.args.key
    const { ipfs } = request.server.app
    await ipfs.bitswap.unwant(key)
    return h.response({ key: cidToString(key, { base: request.query['cid-base'], upgrade: false }) })
  }
}
