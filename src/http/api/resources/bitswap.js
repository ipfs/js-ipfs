'use strict'

const boom = require('boom')

const parseKey = require('./block').parseKey

exports = module.exports

exports.wantlist = {
  handler: (request, reply) => {
    const peerId = request.query.peer
    request.server.app.ipfs.bitswap.wantlist(peerId, (err, list) => {
      if (err) {
        return reply(boom.badRequest(err))
      }
      reply(list)
    })
  }
}

exports.stat = {
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs

    ipfs.bitswap.stat((err, stats) => {
      if (err) {
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      reply({
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
    })
  }
}

exports.unwant = {
  // uses common parseKey method that assigns a `key` to request.pre.args
  parseArgs: parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const ipfs = request.server.app.ipfs
    ipfs.bitswap.unwant(key, (err) => {
      if (err) {
        return reply(boom.badRequest(err))
      }
      reply({ key: key.toBaseEncodedString() })
    })
  }
}
