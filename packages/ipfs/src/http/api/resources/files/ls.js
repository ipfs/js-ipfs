'use strict'

const Joi = require('@hapi/joi')
const all = require('it-all')
const map = require('it-map')
const pipe = require('it-pipe')
const streamResponse = require('../../../utils/stream-response')

const mapEntry = (entry, options) => {
  options = options || {}

  const output = {
    Name: entry.name,
    Type: options.long ? entry.type : 0,
    Size: options.long ? entry.size || 0 : 0,
    Hash: entry.cid.toString(options.cidBase)
  }

  if (entry.mtime) {
    output.Mtime = entry.mtime.secs

    if (entry.mtime.nsecs != null) {
      output.MtimeNsecs = entry.mtime.nsecs
    }
  }

  if (entry.mode != null) {
    output.Mode = entry.mode.toString(8).padStart(4, '0')
  }

  return output
}

const mfsLs = {
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      long,
      cidBase,
      stream
    } = request.query

    if (stream) {
      return streamResponse(request, h, () => pipe(
        ipfs.files.ls(arg),
        source => map(source, (entry) => mapEntry(entry, { cidBase, long })),
        source => map(source, (entry) => JSON.stringify(entry) + '\n')
      ))
    }

    const files = await all(ipfs.files.ls(arg))

    return h.response({
      Entries: files.map(entry => mapEntry(entry, { cidBase, long }))
    })
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().default('/'),
        long: Joi.boolean().default(false),
        cidBase: Joi.string(),
        stream: Joi.boolean().default(false)
      })
        .rename('l', 'long', {
          override: true,
          ignoreUndefined: true
        })
        .rename('s', 'stream', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsLs
