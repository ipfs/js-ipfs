'use strict'

const multipart = require('../../utils/multipart-request-parser')
const mh = require('multihashing-async').multihash
const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const {
  cidToString
} = require('ipfs-core-utils/src/cid')
const all = require('it-all')
const uint8ArrayToString = require('uint8arrays/to-string')

const encodeBufferKeys = (obj, encoding) => {
  if (!obj) {
    return obj
  }

  if (obj instanceof Uint8Array) {
    return uint8ArrayToString(obj, encoding)
  }

  Object.keys(obj).forEach(key => {
    if (obj instanceof Uint8Array) {
      obj[key] = uint8ArrayToString(obj[key], encoding)

      return
    }

    if (typeof obj[key] === 'object') {
      obj[key] = encodeBufferKeys(obj[key], encoding)
    }
  })

  return obj
}

exports.get = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.cidAndPath().required(),
        dataEncoding: Joi.string()
          .valid('ascii', 'base64pad', 'base16', 'utf8')
          .replace(/text/, 'ascii')
          .replace(/base64/, 'base64pad')
          .replace(/hex/, 'base16')
          .default('utf8'),
        timeout: Joi.timeout()
      })
        .rename('data-encoding', 'dataEncoding', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        arg: {
          cid,
          path
        },
        dataEncoding,
        timeout
      }
    } = request

    let result

    try {
      result = await ipfs.dag.get(cid, {
        path,
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.badRequest(err)
    }

    let value = result.value

    if (!(result.value instanceof Uint8Array) && result.value.toJSON) {
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
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      method: async (request, _h) => {
        if (!request.payload) {
          throw Boom.badRequest("File argument 'object data' is required")
        }

        const enc = request.query.inputEncoding

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
          // the node is an uncommon format which the client should have
          // serialized so deserialize it before continuing
          const ipldFormat = await request.server.app.ipfs.ipld.getFormat(format)

          if (!ipldFormat) {
            throw new Error(`Missing IPLD format "${format}"`)
          }

          node = await ipldFormat.util.deserialize(data)
        }

        return {
          node,
          format,
          hashAlg: request.query.hash
        }
      }
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        format: Joi.string().default('cbor'),
        inputEncoding: Joi.string().default('json'),
        pin: Joi.boolean().default(false),
        hash: Joi.string().valid(...Object.keys(mh.names)).default('sha2-256'),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('input-enc', 'inputEncoding', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      pre: {
        args: {
          node,
          format,
          hashAlg
        }
      },
      query: {
        pin,
        cidBase,
        timeout
      }
    } = request

    let cid

    try {
      cid = await ipfs.dag.put(node, {
        format,
        hashAlg,
        pin,
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to put node' })
    }

    return h.response({
      Cid: {
        '/': cidToString(cid, {
          base: cidBase
        })
      }
    })
  }
}

exports.resolve = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.cidAndPath().required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout(),
        path: Joi.string()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        arg: {
          cid,
          path
        },
        cidBase,
        timeout,
        path: queryPath
      }
    } = request

    // to be consistent with go we need to return the CID to the last node we've traversed
    // along with the path inside that node as the remainder path
    try {
      const result = await ipfs.dag.resolve(cid, {
        path: path || queryPath,
        signal,
        timeout
      })

      return h.response({
        Cid: {
          '/': cidToString(result.cid, {
            base: cidBase
          })
        },
        RemPath: result.remainderPath
      })
    } catch (err) {
      throw Boom.boomify(err)
    }
  }
}
