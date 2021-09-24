import Joi from '../../utils/joi.js'
import { pipe } from 'it-pipe'
import map from 'it-map'
import last from 'it-last'
import { streamResponse } from '../../utils/stream-response.js'

export const resolveResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        name: Joi.string(),
        nocache: Joi.boolean().default(false),
        recursive: Joi.boolean().default(true),
        stream: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('arg', 'name', {
          override: true,
          ignoreUndefined: true
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
      query: {
        name,
        nocache,
        recursive,
        stream,
        timeout
      }
    } = request

    if (!stream) {
      const value = await last(ipfs.name.resolve(name, {
        nocache,
        recursive,
        signal,
        timeout
      }))
      return h.response({ Path: value })
    }

    return streamResponse(request, h, () => pipe(
      ipfs.name.resolve(name, {
        nocache,
        recursive,
        signal,
        timeout
      }),
      async function * (source) {
        yield * map(source, value => ({ Path: value }))
      }
    ))
  }
}

export const publishResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        name: Joi.string().required(),
        resolve: Joi.boolean().default(true),
        lifetime: Joi.string().default('24h'),
        ttl: Joi.string().allow(''),
        key: Joi.string().default('self'),
        allowOffline: Joi.boolean(),
        timeout: Joi.timeout()
      })
        .rename('allow-offline', 'allowOffline', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'name', {
          override: true,
          ignoreUndefined: true
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
      query: {
        name,
        resolve,
        lifetime,
        ttl,
        key,
        allowOffline,
        timeout
      }
    } = request

    const res = await ipfs.name.publish(name, {
      resolve,
      lifetime,
      ttl,
      key,
      allowOffline,
      signal,
      timeout
    })

    return h.response({
      Name: res.name,
      Value: res.value
    })
  }
}

export const stateResource = {
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
        timeout
      }
    } = request

    const res = await ipfs.name.pubsub.state({
      signal,
      timeout
    })

    return h.response({
      Enabled: res.enabled
    })
  }
}

export const pubsubSubsResource = {
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
        timeout
      }
    } = request

    const res = await ipfs.name.pubsub.subs({
      signal,
      timeout
    })

    return h.response({
      Strings: res
    })
  }
}

export const pubsubCancelResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        topic: Joi.string().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'topic', {
          override: true,
          ignoreUndefined: true
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
      query: {
        topic,
        timeout
      }
    } = request

    const res = await ipfs.name.pubsub.cancel(topic, {
      signal,
      timeout
    })

    return h.response({
      Canceled: res.canceled
    })
  }
}
