import { logger } from '@libp2p/logger'
import get from 'dlv'
import set from 'just-safe-set'
import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import Boom from '@hapi/boom'
import Joi from '../../utils/joi.js'
import all from 'it-all'

const log = logger('ipfs:http-api:config')

export const getOrSetResource = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      /**
       * @param {import('../../types').Request} request
       * @param {import('@hapi/hapi').ResponseToolkit} _h
       */
      method: (request, _h) => {
        /**
         * @param {{ key: string, value: any }} args
         */
        const parseValue = (args) => {
          if (request.query.bool) {
            args.value = args.value === 'true'
          } else if (request.query.json) {
            try {
              args.value = JSON.parse(args.value)
            } catch (/** @type {any} */ err) {
              log.error(err)
              throw Boom.badRequest('failed to unmarshal json. ' + err)
            }
          }

          return args
        }

        if (request.query.arg instanceof Array) {
          return parseValue({
            key: request.query.arg[0],
            value: request.query.arg[1]
          })
        }

        if (request.params.key) {
          return parseValue({
            key: request.params.key,
            value: request.query.arg
          })
        }

        if (!request.query.arg) {
          throw Boom.badRequest("Argument 'key' is required")
        }

        return { key: request.query.arg }
      }
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().single(),
        key: Joi.string(),
        bool: Joi.boolean().truthy(''),
        json: Joi.boolean().truthy(''),
        timeout: Joi.timeout()
      })
    }
  },

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      pre: {
        args: {
          key,
          value
        }
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

    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
      // serialized node buffer?
      throw Boom.badRequest('Invalid value')
    }

    let originalConfig
    try {
      originalConfig = await ipfs.config.getAll({
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get config value' })
    }

    if (value === undefined) {
      // Get the value of a given key
      const existingValue = get(originalConfig, key)

      if (existingValue === undefined) {
        throw Boom.notFound('Failed to get config value: key has no attributes')
      }

      return h.response({
        Key: key,
        Value: existingValue
      })
    }

    // Set the new value of a given key
    const result = set(originalConfig, key, value)
    if (!result) {
      throw Boom.badRequest('Failed to set config value')
    }

    try {
      await ipfs.config.replace(originalConfig, {
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to replace config value' })
    }

    return h.response({
      Key: key,
      Value: value
    })
  }
}

export const getResource = {
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

    let config
    try {
      config = await ipfs.config.getAll({
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get config value' })
    }

    return h.response({
      Value: config
    })
  }
}

export const showResource = {
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

    let config
    try {
      config = await ipfs.config.getAll({
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get config value' })
    }

    return h.response(config)
  }
}

export const replaceResource = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      /**
       * @param {import('../../types').Request} request
       * @param {import('@hapi/hapi').ResponseToolkit} _h
       */
      method: async (request, _h) => {
        if (!request.payload) {
          throw Boom.badRequest("Argument 'file' is required")
        }

        let file

        for await (const part of multipartRequestParser(request.raw.req)) {
          if (part.type !== 'file') {
            continue
          }

          file = Buffer.concat(await all(part.content))
        }

        if (!file) {
          throw Boom.badRequest("Argument 'file' is required")
        }

        try {
          return { config: JSON.parse(file.toString('utf8')) }
        } catch (/** @type {any} */ err) {
          throw Boom.boomify(err, { message: 'Failed to decode file as config' })
        }
      }
    }],
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
          config
        }
      },
      query: {
        timeout
      }
    } = request

    try {
      await ipfs.config.replace(config, {
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to save config' })
    }

    return h.response()
  }
}

export const profilesApplyResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        profile: Joi.string().required(),
        dryRun: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('dry-run', 'dryRun', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'profile', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  handler: async function (request, h) {
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
        profile,
        dryRun,
        timeout
      }
    } = request

    try {
      const diff = await ipfs.config.profiles.apply(profile, {
        dryRun,
        signal,
        timeout
      })

      return h.response({ OldCfg: diff.original, NewCfg: diff.updated })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to apply profile' })
    }
  }
}

export const profilesListResource = {
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
  handler: async function (request, h) {
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

    const list = await ipfs.config.profiles.list({
      signal,
      timeout
    })

    return h.response(
      list.map(profile => ({
        Name: profile.name,
        Description: profile.description
      }))
    )
  }
}
