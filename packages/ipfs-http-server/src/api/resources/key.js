'use strict'

const Joi = require('../../utils/joi')

function toKeyInfo (key) {
  return {
    Name: key.name,
    Id: key.id
  }
}

exports.list = {
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

    const keys = await ipfs.key.list({
      signal,
      timeout
    })

    return h.response({ Keys: keys.map(toKeyInfo) })
  }
}

exports.rm = {
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

exports.rename = {
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

exports.gen = {
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

exports.import = {
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
