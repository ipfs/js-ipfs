'use strict'

const Joi = require('../../utils/joi')

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

    const list = await ipfs.bootstrap.list({
      timeout,
      signal
    })
    return h.response(list)
  }
}

exports.add = {
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

    const list = await ipfs.bootstrap.add(addr, {
      default: def || !addr,
      signal,
      timeout
    })
    return h.response(list)
  }
}

exports.addDefault = {
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

    const list = await ipfs.bootstrap.add(null, {
      default: true,
      signal,
      timeout
    })
    return h.response(list)
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

    const list = await ipfs.bootstrap.rm(addr, {
      all: all || !addr,
      signal,
      timeout
    })
    return h.response(list)
  }
}

exports.rmAll = {
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

    const list = await ipfs.bootstrap.rm(null, {
      all: true,
      signal,
      timeout
    })
    return h.response(list)
  }
}
