'use strict'

const Joi = require('joi')
const CID = require('cids')

const debug = require('debug')
const log = debug('jsipfs:http-api:dht')
log.error = debug('jsipfs:http-api:dht:error')

exports = module.exports

exports.findPeer = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    ipfs.dht.findPeer(arg, (err, res) => {
      if (err) {
        log.error(err)

        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      reply({
        Responses: [{
          ID: res.id.toB58String(),
          Addrs: res.multiaddrs.toArray().map((a) => a.toString())
        }],
        Type: 2
      })
    })
  }
}

exports.findProvs = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required(),
      'num-providers': Joi.number().integer().default(20)
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query
    const cid = new CID(arg)

    ipfs.dht.findProvs(cid, request.query, (err, res) => {
      if (err) {
        log.error(err)

        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      reply({
        Responses: res.map((peerInfo) => ({
          ID: peerInfo.id.toB58String(),
          Addrs: peerInfo.multiaddrs.toArray().map((a) => a.toString())
        })),
        Type: 4
      })
    })
  }
}

exports.get = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    ipfs.dht.get(Buffer.from(arg), (err, res) => {
      if (err) {
        log.error(err)

        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      reply({
        Extra: res.toString(),
        Type: 5
      })
    })
  }
}

exports.provide = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query
    let cid

    try {
      cid = new CID(arg)
    } catch (err) {
      log.error(err)

      return reply({
        Message: err.toString(),
        Code: 0
      }).code(500)
    }

    ipfs.dht.provide(cid, request.query, (err) => {
      if (err) {
        log.error(err)

        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      reply({})
    })
  }
}

exports.put = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.array().items(Joi.string()).length(2).required()
    }).unknown()
  },
  parseArgs: (request, reply) => {
    return reply({
      key: request.query.arg[0],
      value: request.query.arg[1]
    })
  },
  handler: (request, reply) => {
    const key = request.pre.args.key
    const value = request.pre.args.value
    const ipfs = request.server.app.ipfs

    ipfs.dht.put(Buffer.from(key), Buffer.from(value), (err) => {
      if (err) {
        log.error(err)

        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      reply({})
    })
  }
}

exports.query = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required()
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    ipfs.dht.query(arg, (err, res) => {
      if (err) {
        log.error(err)

        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      const response = res.map((peerInfo) => ({
        ID: peerInfo.id.toB58String()
      }))

      reply(response)
    })
  }
}
