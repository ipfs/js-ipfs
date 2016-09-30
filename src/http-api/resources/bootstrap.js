'use strict'

const boom = require('boom')
const multiaddr = require('multiaddr')

exports = module.exports

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'multiaddr' is required").code(400).takeover()
  }

  try {
    return reply({
      addr: multiaddr(request.query.arg)
    })
  } catch (err) {
    return reply({
      Message: 'Not a valid multiaddr',
      Code: 0
    }).code(500).takeover()
  }
}

exports.list = (request, reply) => {
  const ipfs = request.server.app.ipfs
  ipfs.bootstrap.list((err, list) => {
    if (err) {
      return reply(boom.badRequest(err))
    }
    return reply(list)
  })
}

exports.add = {
  parseArgs: exports.parseKey,
  handler (request, reply) {
    const ipfs = request.server.app.ipfs
    const addr = request.pre.args.addr

    ipfs.bootstrap.add(addr.toString(), (err, list) => {
      if (err) {
        return reply(boom.badRequest(err))
      }
      return reply()
    })
  }
}

exports.rm = {
  parseArgs: exports.parseKey,
  handler (request, reply) {
    const ipfs = request.server.app.ipfs
    const addr = request.pre.args.addr

    ipfs.bootstrap.rm(addr.toString(), (err, list) => {
      if (err) {
        return reply(boom.badRequest(err))
      }
      return reply()
    })
  }
}
