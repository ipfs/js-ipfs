'use strict'

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const all = require('it-all')
const CID = require('cids')
const pipe = require('it-pipe')
const { Buffer } = require('buffer')
const ndjson = require('iterable-ndjson')
const toStream = require('it-to-stream')
const { map } = require('streaming-iterables')

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
      res = await ipfs.dht.findPeer(new CID(arg))
    } catch (err) {
      if (err.code === 'ERR_LOOKUP_FAILED') {
        throw Boom.notFound(err.toString())
      } else {
        throw Boom.boomify(err, { message: err.toString() })
      }
    }

    return h.response({
      Responses: [{
        ID: res.id.toString(),
        Addrs: res.addrs.map(a => a.toString())
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

    const res = await all(ipfs.dht.findProvs(new CID(arg), {
      numProviders: request.query['num-providers']
    }))

    return h.response({
      Responses: res.map(({ id, addrs }) => ({
        ID: id.toString(),
        Addrs: addrs.map(a => a.toString())
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
    const ipfs = request.server.app.ipfs
    const { key, value } = request.pre.args

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
  handler (request, h) {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    const response = toStream.readable(
      pipe(
        ipfs.dht.query(arg),
        map(({ id }) => ({ ID: id.toString() })),
        ndjson.stringify
      )
    )

    return h.response(response)
  }
}
