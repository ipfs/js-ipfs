'use strict'

const boom = require('boom')

const parseKey = require('./block').parseKey

exports = module.exports

exports.wantlist = (request, reply) => {
  let list
  try {
    list = request.server.app.ipfs.bitswap.wantlist()
  } catch (err) {
    return reply(boom.badRequest(err))
  }

  reply({
    Keys: list
  })
}

exports.stat = (request, reply) => {
  let stats
  try {
    stats = request.server.app.ipfs.bitswap.stat()
  } catch (err) {
    return reply(boom.badRequest(err))
  }

  reply({
    BlocksReceived: stats.blocksReceived,
    Wantlist: stats.wantlist,
    Peers: stats.peers,
    DupBlksReceived: stats.dupBlksReceived,
    DupDataReceived: stats.dupDataReceived
  })
}

exports.unwant = {
  // uses common parseKey method that returns a `key`
  parseArgs: parseKey,

  handler: (request, reply) => {
    reply(boom.badRequrest(new Error('Not implemented yet')))
  }
}
