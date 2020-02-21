'use strict'

const multiaddr = require('multiaddr')
const Boom = require('@hapi/boom')

exports.list = async (request, h) => {
  const { ipfs } = request.server.app
  const list = await ipfs.bootstrap.list()
  return h.response(list)
}

exports.add = {
  parseArgs (request, h) {
    const q = request.query
    const def = q.default === 'true'

    if (q.arg != null) {
      try {
        return {
          addr: multiaddr(q.arg),
          default: def
        }
      } catch (err) {
        throw Boom.badRequest('Not a valid multiaddr')
      }
    }

    return { default: def }
  },
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { addr, default: def } = request.pre.args
    const list = await ipfs.bootstrap.add(addr && addr.toString(), { default: def })
    return h.response(list)
  }
}

exports.addDefault = async (request, h) => {
  const { ipfs } = request.server.app
  const list = await ipfs.bootstrap.add(null, { default: true })
  return h.response(list)
}

exports.rm = {
  parseArgs (request, h) {
    const q = request.query
    const all = q.all === 'true'

    if (q.arg != null) {
      try {
        return {
          addr: multiaddr(q.arg),
          all: all
        }
      } catch (err) {
        throw Boom.badRequest('Not a valid multiaddr')
      }
    }

    return { all }
  },
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { addr, all } = request.pre.args
    const list = await ipfs.bootstrap.rm(addr && addr.toString(), { all })
    return h.response(list)
  }
}

exports.rmAll = async (request, h) => {
  const { ipfs } = request.server.app
  const list = await ipfs.bootstrap.rm(null, { all: true })
  return h.response(list)
}
