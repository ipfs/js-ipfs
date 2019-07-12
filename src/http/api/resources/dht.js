'use strict'

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')

const CID = require('cids')

const debug = require('debug')
const log = debug('ipfs:http-api:dht')
log.error = debug('ipfs:http-api:dht:error')

exports = module.exports

exports.findPeer = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  async handler (request, h) {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query
    let res

    try {
      res = await ipfs.dht.findPeer(arg)
    } catch (err) {
      if (err.code === 'ERR_LOOKUP_FAILED') {
        throw Boom.notFound(err.toString())
      } else {
        throw Boom.boomify(err, { message: err.toString() })
      }
    }

    return h.response({
      Responses: [{
        ID: res.id.toB58String(),
        Addrs: res.multiaddrs.toArray().map((a) => a.toString())
      }],
      Type: 2
    })
  }
}

exports.findProvs = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required(),
      'num-providers': Joi.number().integer().default(20),
      timeout: Joi.number()
    }).unknown()
  },
  async handler (request, h) {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    request.query.maxNumProviders = request.query['num-providers']

    const res = await ipfs.dht.findProvs(arg, request.query)

    return h.response({
      Responses: res.map((peerInfo) => ({
        ID: peerInfo.id.toB58String(),
        Addrs: peerInfo.multiaddrs.toArray().map((a) => a.toString())
      })),
      Type: 4
    })
  }
}

exports.get = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required(),
      timeout: Joi.number()
    }).unknown()
  },
  async handler (request, h) {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    const res = await ipfs.dht.get(Buffer.from(arg))

    return h.response({
      Extra: res.toString(),
      Type: 5
    })
  }
}

exports.provide = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  async handler (request, h) {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query
    let cid

    try {
      cid = new CID(arg)
    } catch (err) {
      log.error(err)
      throw Boom.boomify(err, { message: err.toString() })
    }

    await ipfs.dht.provide(cid)

    return h.response()
  }
}

exports.put = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.array().items(Joi.string()).length(2).required()
    }).unknown()
  },
  parseArgs: (request, h) => {
    return {
      key: request.query.arg[0],
      value: request.query.arg[1]
    }
  },
  async handler (request, h) {
    const key = request.pre.args.key
    const value = request.pre.args.value
    const ipfs = request.server.app.ipfs

    await ipfs.dht.put(Buffer.from(key), Buffer.from(value))

    return h.response()
  }
}

exports.query = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  async handler (request, h) {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    const res = await ipfs.dht.query(arg)
    const response = res.map((peerInfo) => ({
      ID: peerInfo.id.toB58String()
    }))

    return h.response(response)
  }
}
