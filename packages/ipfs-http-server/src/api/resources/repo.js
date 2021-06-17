'use strict'

const Joi = require('../../utils/joi')
const map = require('it-map')
const filter = require('it-filter')
const { pipe } = require('it-pipe')
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
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
      async function * filterErrors (source) {
        yield * filter(source, r => !r.err || streamErrors)
      },
      async function * transformGcOutput (source) {
        yield * map(source, r => ({
          Error: (r.err && r.err.message) || undefined,
          Key: (!r.err && { '/': r.cid.toString() }) || undefined
        }))
      }
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
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
      NumObjects: stat.numObjects.toString(),
      RepoSize: stat.repoSize.toString(),
      RepoPath: stat.repoPath,
      Version: stat.version,
      StorageMax: stat.storageMax.toString()
    })
  }

}
