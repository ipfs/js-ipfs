'use strict'

const boom = require('boom')
const bs58 = require('bs58')

const parseKey = require('./block').parseKey

exports = module.exports

function formatWantlist (list) {
  return Array.from(list).map((el) => bs58.encode(el[1]))
}

exports.wantlist = (request, reply) => {
  let list
  try {
    list = request.server.app.ipfs.bitswap.wantlist()
  } catch (err) {
    return reply(boom.badRequest(err))
  }

  reply({
    Keys: formatWantlist(list)
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
    Wantlist: formatWantlist(stats.wantlist),
    Peers: stats.peers.map((id) => id.toB58String()),
    DupBlksReceived: stats.dupBlksReceived,
    DupDataReceived: stats.dupDataReceived
  })
}

exports.unwant = {
  // uses common parseKey method that returns a `key`
  parseArgs: parseKey,

  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.bitswap.unwant(key)
    reply()
  }
}
