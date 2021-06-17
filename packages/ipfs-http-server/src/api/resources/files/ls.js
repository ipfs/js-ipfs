'use strict'

const Joi = require('../../../utils/joi')
const all = require('it-all')
const map = require('it-map')
const { pipe } = require('it-pipe')
const streamResponse = require('../../../utils/stream-response')

/**
 * @param {*} entry
 * @param {{ cidBase?: string, long?: boolean }} options
 */
const mapEntry = (entry, options = {}) => {
  const type = entry.type === 'file' ? 0 : 1

  return {
    Name: entry.name,
    Type: options.long ? type : 0,
    Size: options.long ? entry.size || 0 : 0,
    Hash: entry.cid.toString(options.cidBase),
    Mtime: entry.mtime ? entry.mtime.secs : undefined,
    MtimeNsecs: entry.mtime ? entry.mtime.nsecs : undefined,
    Mode: entry.mode != null ? entry.mode.toString(8).padStart(4, '0') : undefined
  }
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

  /**
   * @param {import('../../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
        source => map(source, (entry) => mapEntry(entry, { cidBase, long }))
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
