import Boom from '@hapi/boom'
import Joi from '../../utils/joi.js'

export const listResource = {
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

    const list = await ipfs.bootstrap.list({
      timeout,
      signal
    })
    return h.response(list)
  }
}

export const addResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        addr: Joi.multiaddr(),
        default: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('arg', 'addr', {
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
        addr,
        default: def,
        timeout
      }
    } = request

    let list

    if (def) {
      list = await ipfs.bootstrap.reset({
        signal,
        timeout
      })
    } else if (addr) {
      list = await ipfs.bootstrap.add(addr, {
        signal,
        timeout
      })
    } else {
      throw Boom.badRequest('arg is required')
    }

    return h.response(list)
  }
}

export const addDefaultResource = {
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

    const list = await ipfs.bootstrap.reset({
      signal,
      timeout
    })
    return h.response(list)
  }
}

export const rmResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        addr: Joi.multiaddr(),
        all: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('arg', 'addr', {
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
        addr,
        all,
        timeout
      }
    } = request

    let list

    if (all) {
      list = await ipfs.bootstrap.clear({
        signal,
        timeout
      })
    } else if (addr) {
      list = await ipfs.bootstrap.rm(addr, {
        signal,
        timeout
      })
    } else {
      throw Boom.badRequest('arg is required')
    }

    return h.response(list)
  }
}

export const rmAllResource = {
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

    const list = await ipfs.bootstrap.clear({
      signal,
      timeout
    })

    return h.response(list)
  }
}
