'use strict'

const CID = require('cids')
const multipart = require('../../utils/multipart-request-parser')
const mh = require('multihashes')
const Joi = require('@hapi/joi')
const multibase = require('multibase')
const multicodec = require('multicodec')
const Boom = require('@hapi/boom')
const debug = require('debug')
const { Buffer } = require('buffer')
const {
  cidToString
} = require('../../../utils/cid')
const all = require('it-all')
const log = debug('ipfs:http-api:dag')
log.error = debug('ipfs:http-api:dag:error')

const IpldFormats = {
  get [multicodec.RAW] () {
    return require('ipld-raw')
  },
  get [multicodec.DAG_PB] () {
    return require('ipld-dag-pb')
  },
  get [multicodec.DAG_CBOR] () {
    return require('ipld-dag-cbor')
  },
  get [multicodec.BITCOIN_BLOCK] () {
    return require('ipld-bitcoin')
  },
  get [multicodec.ETH_ACCOUNT_SNAPSHOT] () {
    return require('ipld-ethereum').ethAccountSnapshot
  },
  get [multicodec.ETH_BLOCK] () {
    return require('ipld-ethereum').ethBlock
  },
  get [multicodec.ETH_BLOCK_LIST] () {
    return require('ipld-ethereum').ethBlockList
  },
  get [multicodec.ETH_STATE_TRIE] () {
    return require('ipld-ethereum').ethStateTrie
  },
  get [multicodec.ETH_STORAGE_TRIE] () {
    return require('ipld-ethereum').ethStorageTrie
  },
  get [multicodec.ETH_TX] () {
    return require('ipld-ethereum').ethTx
  },
  get [multicodec.ETH_TX_TRIE] () {
    return require('ipld-ethereum').ethTxTrie
  },
  get [multicodec.GIT_RAW] () {
    return require('ipld-git')
  },
  get [multicodec.ZCASH_BLOCK] () {
    return require('ipld-zcash')
  }
}

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (argument = 'Argument', name = 'key', quote = "'") => {
  return (request) => {
    if (!request.query.arg) {
      // for compatibility with go error messages
      throw Boom.badRequest(`${argument} ${quote}${name}${quote} is required`)
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

    if (path && path.endsWith('/')) {
      path = path.substring(0, path.length - 1)
    }

    try {
      return {
        [name]: new CID(key),
        path
      }
    } catch (err) {
      log.error(err)
      throw Boom.badRequest("invalid 'ipfs ref' path")
    }
  }
}

const encodeBufferKeys = (obj, encoding) => {
  if (!obj) {
    return obj
  }

  if (Buffer.isBuffer(obj)) {
    return obj.toString(encoding)
  }

  Object.keys(obj).forEach(key => {
    if (Buffer.isBuffer(obj)) {
      obj[key] = obj[key].toString(encoding)

      return
    }

    if (typeof obj[key] === 'object') {
      obj[key] = encodeBufferKeys(obj[key], encoding)
    }
  })

  return obj
}

exports.get = {
  validate: {
    query: Joi.object().keys({
      'data-encoding': Joi.string().valid('text', 'base64', 'hex').default('text'),
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey(),

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const {
      key,
      path
    } = request.pre.args
    const { ipfs } = request.server.app

    let dataEncoding = request.query['data-encoding']

    if (dataEncoding === 'text') {
      dataEncoding = 'utf8'
    }

    let result

    try {
      result = await ipfs.dag.get(key, path)
    } catch (err) {
      throw Boom.badRequest(err)
    }

    let value = result.value

    if (!Buffer.isBuffer(result.value) && result.value.toJSON) {
      value = result.value.toJSON()
    }

    try {
      result.value = encodeBufferKeys(value, dataEncoding)
    } catch (err) {
      throw Boom.boomify(err)
    }

    return h.response(result.value)
  }
}

exports.put = {
  validate: {
    query: Joi.object().keys({
      format: Joi.string().default('cbor'),
      'input-enc': Joi.string().default('json'),
      pin: Joi.boolean().default(false),
      hash: Joi.string().valid(...Object.keys(mh.names)).default('sha2-256'),
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // pre request handler that parses the args and returns `node`
  // which is assigned to `request.pre.args`
  async parseArgs (request, h) {
    if (!request.payload) {
      throw Boom.badRequest("File argument 'object data' is required")
    }

    const enc = request.query['input-enc']

    if (!request.headers['content-type']) {
      throw Boom.badRequest("File argument 'object data' is required")
    }

    let data

    for await (const part of multipart(request)) {
      if (part.type !== 'file') {
        continue
      }

      data = Buffer.concat(await all(part.content))
    }

    if (!data) {
      throw Boom.badRequest("File argument 'object data' is required")
    }

    let format = request.query.format

    if (format === 'cbor') {
      format = 'dag-cbor'
    }

    let node

    if (format === 'raw') {
      node = data
    } else if (enc === 'json') {
      try {
        node = JSON.parse(data.toString())
      } catch (err) {
        throw Boom.badRequest('Failed to parse the JSON: ' + err)
      }
    } else {
      const codec = multicodec[format.toUpperCase().replace(/-/g, '_')]
      if (!IpldFormats[codec]) throw new Error(`Missing IPLD format "${codec}"`)
      node = await IpldFormats[codec].util.deserialize(data)
    }

    return {
      node,
      format,
      hashAlg: request.query.hash
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { node, format, hashAlg } = request.pre.args

    let cid

    try {
      cid = await ipfs.dag.put(node, {
        format: format,
        hashAlg: hashAlg,
        pin: request.query.pin
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to put node' })
    }

    return h.response({
      Cid: {
        '/': cidToString(cid, {
          base: request.query['cid-base']
        })
      }
    })
  }
}

exports.resolve = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey('argument', 'ref', '"'),

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ref, path } = request.pre.args
    const { ipfs } = request.server.app

    // to be consistent with go we need to return the CID to the last node we've traversed
    // along with the path inside that node as the remainder path
    try {
      let lastCid = ref
      let lastRemainderPath = path

      if (path) {
        for await (const { value, remainderPath } of ipfs.dag.resolve(lastCid, path)) {
          if (!CID.isCID(value)) {
            break
          }

          lastRemainderPath = remainderPath
          lastCid = value
        }
      }

      return h.response({
        Cid: {
          '/': cidToString(lastCid, {
            base: request.query['cid-base']
          })
        },
        RemPath: lastRemainderPath || ''
      })
    } catch (err) {
      throw Boom.boomify(err)
    }
  }
}
