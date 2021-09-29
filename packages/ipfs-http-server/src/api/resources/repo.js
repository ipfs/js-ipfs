import Joi from '../../utils/joi.js'
import map from 'it-map'
import filter from 'it-filter'
import { pipe } from 'it-pipe'
import { streamResponse } from '../../utils/stream-response.js'

export const gcResource = {
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

export const versionResource = {
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

export const statResource = {
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
