'use strict'

const multiaddr = require('multiaddr')
const Boom = require('@hapi/boom')

// common pre request handler that parses the args and returns `addr` which is assigned to `request.pre.args`
exports.parseAddrs = (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest('Argument `addr` is required')
  }

  try {
    multiaddr(request.query.arg)
  } catch (err) {
    throw Boom.boomify(err, { statusCode: 400 })
  }

  return {
    addr: request.query.arg
  }
}

exports.peers = {
  async handler (request, h) {
    const rawVerbose = request.query.v || request.query.verbose
    const verbose = rawVerbose === 'true'
    const { ipfs } = request.server.app

    const peers = await ipfs.swarm.peers({ verbose })

    return h.response({
      Peers: peers.map((p) => {
        const res = {
          Peer: p.peer.toB58String(),
          Addr: p.addr.toString()
        }

        if (verbose) {
          res.Latency = p.latency
        }

        return res
      })
    })
  }
}

exports.addrs = {
  async handler (request, h) {
    const { ipfs } = request.server.app
    const peers = await ipfs.swarm.addrs()

    const addrs = {}
    peers.forEach((peer) => {
      addrs[peer.id.toB58String()] = peer.multiaddrs.toArray()
        .map((addr) => addr.toString())
    })

    return h.response({
      Addrs: addrs
    })
  }
}

exports.localAddrs = {
  async handler (request, h) {
    const { ipfs } = request.server.app
    const addrs = await ipfs.swarm.localAddrs()

    return h.response({
      Strings: addrs.map((addr) => addr.toString())
    })
  }
}

exports.connect = {
  // uses common parseAddr method that returns a `addr`
  parseArgs: exports.parseAddrs,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { addr } = request.pre.args
    const { ipfs } = request.server.app

    await ipfs.swarm.connect(addr)

    return h.response({
      Strings: [`connect ${addr} success`]
    })
  }
}

exports.disconnect = {
  // uses common parseAddr method that returns a `addr`
  parseArgs: exports.parseAddrs,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { addr } = request.pre.args
    const { ipfs } = request.server.app

    await ipfs.swarm.disconnect(addr)

    return h.response({
      Strings: [`disconnect ${addr} success`]
    })
  }
}
