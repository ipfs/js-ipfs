'use strict'

const Joi = require('../../../utils/joi')
const multipart = require('../../../utils/multipart-request-parser')
const Boom = require('@hapi/boom')
const drain = require('it-drain')

const mfsWrite = {
  options: {
    payload: {
      parse: false,
      output: 'stream',
      maxBytes: Number.MAX_SAFE_INTEGER
    },
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().regex(/^\/.+/).required(),
        offset: Joi.number().integer().min(0),
        length: Joi.number().integer().min(0),
        create: Joi.boolean().default(false),
        truncate: Joi.boolean().default(false),
        rawLeaves: Joi.boolean().default(false),
        cidVersion: Joi.number().integer().valid(0, 1).default(0),
        hashAlg: Joi.string().default('sha2-256'),
        parents: Joi.boolean().default(false),
        progress: Joi.func(),
        strategy: Joi.string().valid('flat', 'balanced', 'trickle').default('trickle'),
        flush: Joi.boolean().default(true),
        reduceSingleLeafToSelf: Joi.boolean().default(false),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
      })
        .rename('o', 'offset', {
          override: true,
          ignoreUndefined: true
        })
        .rename('e', 'create', {
          override: true,
          ignoreUndefined: true
        })
        .rename('t', 'truncate', {
          override: true,
          ignoreUndefined: true
        })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash-alg', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-version', 'cidVersion', {
          override: true,
          ignoreUndefined: true
        })
        .rename('raw-leaves', 'rawLeaves', {
          override: true,
          ignoreUndefined: true
        })
        .rename('reduce-single-leaf-to-self', 'reduceSingleLeafToSelf', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      offset,
      length,
      create,
      truncate,
      rawLeaves,
      reduceSingleLeafToSelf,
      cidVersion,
      hashAlg,
      parents,
      progress,
      strategy,
      flush,
      shardSplitThreshold,
      timeout
    } = request.query

    let files = 0

    for await (const entry of multipart(request)) {
      if (entry.type === 'file') {
        files++

        if (files > 1) {
          throw Boom.badRequest('Please only send one file')
        }

        await ipfs.files.write(arg, entry.content, {
          offset,
          length,
          create,
          truncate,
          rawLeaves,
          reduceSingleLeafToSelf,
          cidVersion,
          hashAlg,
          parents,
          progress,
          strategy,
          flush,
          shardSplitThreshold,
          mode: entry.mode,
          mtime: entry.mtime,
          signal: request.app.signal,
          timeout
        })

        // if we didn't read the whole body, read it and discard the remainder
        // otherwise the request will never end
        await drain(entry.content)
      }
    }

    return h.response()
  }
}

module.exports = mfsWrite
