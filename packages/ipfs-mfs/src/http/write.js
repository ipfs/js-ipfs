'use strict'

const Joi = require('@hapi/joi')
const multipart = require('ipfs-multipart')
const Boom = require('@hapi/boom')

const mfsWrite = {
  method: 'POST',
  path: '/api/v0/files/write',
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
      shardSplitThreshold
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
          mtime: entry.mtime
        })
      }
    }

    return h.response()
  },
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required(),
        offset: Joi.number().integer().min(0),
        length: Joi.number().integer().min(0),
        create: Joi.boolean().default(false),
        truncate: Joi.boolean().default(false),
        rawLeaves: Joi.boolean().default(false),
        cidVersion: Joi.number().integer().valid([
          0,
          1
        ]).default(0),
        hashAlg: Joi.string().default('sha2-256'),
        parents: Joi.boolean().default(false),
        progress: Joi.func(),
        strategy: Joi.string().valid([
          'flat',
          'balanced',
          'trickle'
        ]).default('trickle'),
        flush: Joi.boolean().default(true),
        reduceSingleLeafToSelf: Joi.boolean().default(false),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000)
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
    }
  }
}

module.exports = mfsWrite
