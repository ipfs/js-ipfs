import Joi from '../../utils/joi.js'

/**
 * @param {any} key
 */
function toKeyInfo (key) {
  return {
    Name: key.name,
    Id: key.id
  }
}

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

    const keys = await ipfs.key.list({
      signal,
      timeout
    })

    return h.response({ Keys: keys.map(toKeyInfo) })
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
        name: Joi.string().required(),
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
        name,
        timeout
      }
    } = request

    const key = await ipfs.key.rm(name, {
      timeout,
      signal
    })

    return h.response({ Keys: [toKeyInfo(key)] })
  }
}

export const renameResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().single().length(2).required(),
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
        arg: [
          oldName,
          newName
        ],
        timeout
      }
    } = request

    const key = await ipfs.key.rename(oldName, newName, {
      signal,
      timeout
    })

    return h.response({
      Was: key.was,
      Now: key.now,
      Id: key.id,
      Overwrite: key.overwrite
    })
  }
}

export const genResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().default('rsa'),
        size: Joi.number().integer().default(2048),
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
        name,
        type,
        size,
        timeout
      }
    } = request

    const key = await ipfs.key.gen(name, {
      type,
      size,
      signal,
      timeout
    })

    return h.response(toKeyInfo(key))
  }
}

export const importResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        name: Joi.string().required(),
        password: Joi.string().required(),
        pem: Joi.string().required(),
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
        name,
        password,
        pem,
        timeout
      }
    } = request

    const key = await ipfs.key.import(name, pem, password, {
      signal,
      timeout
    })

    return h.response(toKeyInfo(key))
  }
}
