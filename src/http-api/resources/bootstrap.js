'use strict'

const multiaddr = require('multiaddr')

exports = module.exports

function applyError (reply, err) {
  reply({
    Message: err.message,
    Code: 0
  }).code(500).takeover()
}

exports.list = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs.bootstrap.list((err, list) => {
    if (err) {
      return applyError(reply, err)
    }

    return reply(list)
  })
}

exports.add = {
  parseArgs (request, reply) {
    const q = request.query
    const def = q.default === 'true'

    if (q.arg != null) {
      try {
        return reply({
          addr: multiaddr(q.arg),
          default: def
        })
      } catch (err) {
        return applyError(reply, new Error('Not a valid multiaddr'))
      }
    } else {
      reply({default: def})
    }
  },
  handler (request, reply) {
    const ipfs = request.server.app.ipfs
    const addr = request.pre.args.addr
    const def = request.pre.args.default

    ipfs.bootstrap.add(addr && addr.toString(), {default: def}, (err, list) => {
      if (err) {
        return applyError(reply, err)
      }

      return reply(list)
    })
  }
}

exports.rm = {
  parseArgs (request, reply) {
    const q = request.query
    const all = q.all === 'true'

    if (q.arg != null) {
      try {
        return reply({
          addr: multiaddr(q.arg),
          all: all
        })
      } catch (err) {
        return applyError(reply, new Error('Not a valid multiaddr'))
      }
    } else {
      reply({all: all})
    }
  },
  handler (request, reply) {
    const ipfs = request.server.app.ipfs
    const addr = request.pre.args.addr
    const all = request.pre.args.all

    ipfs.bootstrap.rm(addr && addr.toString(), {all: all}, (err, list) => {
      if (err) {
        return applyError(reply, err)
      }

      return reply(list)
    })
  }
}
