'use strict'

const Joi = require('../../../utils/joi')
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
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        path: Joi.string().default('/'),
        long: Joi.boolean().default(false),
        cidBase: Joi.cidBase(),
        stream: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('arg', 'path', {
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
        path,
        long,
        cidBase,
        stream,
        timeout
      }
    } = request

    if (stream) {
      return streamResponse(request, h, () => pipe(
        ipfs.files.ls(path, {
          signal,
          timeout
        }),
        source => map(source, (entry) => mapEntry(entry, { cidBase, long })),
        source => map(source, (entry) => JSON.stringify(entry) + '\n')
      ))
    }

    const files = await all(ipfs.files.ls(path, {
      signal,
      timeout
    }))

    return h.response({
      Entries: files.map(entry => mapEntry(entry, { cidBase, long }))
    })
  }
}

module.exports = mfsLs
