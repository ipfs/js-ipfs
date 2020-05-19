'use strict'

const Joi = require('../../utils/joi')
const { map, filter } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

exports.gc = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        streamErrors: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('stream-errors', 'streamErrors', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  handler (request, h) {
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
        streamErrors,
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.repo.gc({
        signal,
        timeout
      }),
      filter(r => !r.err || streamErrors),
      map(r => ({
        Error: (r.err && r.err.message) || undefined,
        Key: (!r.err && { '/': r.cid.toString() }) || undefined
      })),
      ndjson.stringify
    ))
  }
}

exports.version = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        timeout: Joi.timeout()
      })
    }
  },
  handler: async (request, h) => {
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
        timeout
      }
    } = request

    const version = await ipfs.repo.version({
      signal,
      timeout
    })
    return h.response({
      Version: version
    })
  }
}

exports.stat = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        timeout: Joi.timeout()
      })
    }
  },
  handler: async (request, h) => {
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
        timeout
      }
    } = request

    const stat = await ipfs.repo.stat({
      signal,
      timeout
    })

    return h.response({
      NumObjects: stat.numObjects,
      RepoSize: stat.repoSize,
      RepoPath: stat.repoPath,
      Version: stat.version,
      StorageMax: stat.storageMax
    })
  }

}
