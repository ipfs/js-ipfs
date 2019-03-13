'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const multipart = require('ipfs-multipart')
const Joi = require('joi')
const multibase = require('multibase')
const Boom = require('boom')
const debug = require('debug')
const log = debug('ipfs:http-api:dag')
log.error = debug('ipfs:http-api:dag:error')

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest("Argument 'key' is required")
  }

  let key = request.query.arg.trim()
  let path

  if (key.startsWith('/ipfs')) {
    key = key.substring(5)
  }

  const parts = key.split('/')

  if (parts.length > 1) {
    key = parts.shift()
    path = `${parts.join('/')}`
  }

  if (path.endsWith('/')) {
    path = path.substring(0, path.length - 1)
  }

  try {
    return {
      key: new CID(key),
      path
    }
  } catch (err) {
    log.error(err)
    throw Boom.badRequest("invalid 'ipfs ref' path")
  }
}

exports.get = {
  validate: {
    query: Joi.object().keys({
      'data-encoding': Joi.string().valid(['text', 'base64']).default('base64'),
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const {
      key,
      path
    } = request.pre.args
    const { ipfs } = request.server.app

    let result

    try {
      result = await ipfs.dag.get(key, path)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get dag node' })
    }

    if (key.codec === 'dag-pb' && result.value) {
      if (typeof result.value.toJSON === 'function') {
        result.value = result.value.toJSON()
      }

      if (Buffer.isBuffer(result.value.data)) {
        result.value.data = result.value.data.toString(request.query.dataencoding)
      }
    }

    return h.response(result.value)
  }
}

exports.put = {
  validate: {
    query: Joi.object().keys({
      // TODO validate format, & hash
      format: Joi.string(),
      'input-enc': Joi.string().valid('dag-cbor', 'dag-pb', 'raw'),
      pin: Joi.boolean(),
      hash: Joi.string(),
      'cid-base': Joi.string().valid(multibase.names).default('base58btc')
    }).unknown()
  },

  // pre request handler that parses the args and returns `node`
  // which is assigned to `request.pre.args`
  async parseArgs (request, h) {
    if (!request.payload) {
      throw Boom.badRequest("File argument 'data' is required")
    }

    const enc = request.query.inputenc

    const fileStream = await new Promise((resolve, reject) => {
      multipart.reqParser(request.payload)
        .on('file', (name, stream) => resolve(stream))
        .on('end', () => reject(Boom.badRequest("File argument 'data' is required")))
    })

    let data = await new Promise((resolve, reject) => {
      fileStream
        .on('data', data => resolve(data))
        .on('end', () => reject(Boom.badRequest("File argument 'data' is required")))
    })

    if (enc === 'json') {
      try {
        data = JSON.parse(data.toString())
      } catch (err) {
        throw Boom.badRequest('Failed to parse the JSON: ' + err)
      }
    }

    try {
      return {
        buffer: data
      }
    } catch (err) {
      throw Boom.badRequest('Failed to create DAG node: ' + err)
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { buffer } = request.pre.args

    let cid

    return new Promise((resolve, reject) => {
      const format = ipfs._ipld.resolvers[request.query.format]

      if (!format) {
        return reject(Boom.badRequest(`Missing IPLD format "${request.query.format}"`))
      }

      format.util.deserialize(buffer, async (err, node) => {
        if (err) {
          return reject(err)
        }

        try {
          cid = await ipfs.dag.put(node, {
            format: request.query.format,
            hashAlg: request.query.hash
          })
        } catch (err) {
          throw Boom.boomify(err, { message: 'Failed to put node' })
        }

        if (request.query.pin) {
          await ipfs.pin.add(cid)
        }

        resolve(h.response({
          Cid: {
            '/': cid.toBaseEncodedString(request.query.cidbase)
          }
        }))
      })
    })
  }
}

exports.resolve = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    let { key, path } = request.pre.args
    const cidBase = request.query['cid-base']
    const { ipfs } = request.server.app

    // to be consistent with go we need to return the CID to the last node we've traversed
    // along with the path inside that node as the remainder path
    try {
      let lastCid = key
      let lastRemainderPath = path

      while (true) {
        const block = await ipfs.block.get(lastCid)
        const codec = ipfs._ipld.resolvers[lastCid.codec]

        if (!codec) {
          throw Boom.badRequest(`Missing IPLD format "${lastCid.codec}"`)
        }

        const resolve = promisify(codec.resolver.resolve)
        const res = await resolve(block.data, lastRemainderPath)

        if (!res.remainderPath) {
          break
        }

        lastRemainderPath = res.remainderPath

        if (!CID.isCID(res.value)) {
          break
        }

        lastCid = res.value
      }

      return h.response({
        Cid: {
          '/': lastCid.toBaseEncodedString(cidBase)
        },
        RemPath: lastRemainderPath
      })
    } catch (err) {
      throw Boom.boomify(err)
    }
  }
}
