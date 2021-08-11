'use strict'

const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const { pipe } = require('it-pipe')
const map = require('it-map')
const streamResponse = require('../../utils/stream-response')

exports.findPeer = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peerId: Joi.string().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'peerId', {
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
        peerId,
        timeout
      }
    } = request

    let res

    try {
      res = await ipfs.dht.findPeer(peerId, {
        signal,
        timeout
      })
    } catch (err) {
      if (err.code === 'ERR_LOOKUP_FAILED') {
        throw Boom.notFound(err.toString())
      } else {
        throw Boom.boomify(err, { message: err.toString() })
      }
    }

    return h.response({
      Responses: [{
        ID: res.id.toString(),
        Addrs: (res.addrs || []).map(a => a.toString())
      }],
      Type: 2
    })
  }
}

exports.findProvs = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        numProviders: Joi.number().integer().default(20),
        timeout: Joi.timeout()
      })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
        .rename('num-providers', 'numProviders', {
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
        cid,
        numProviders,
        timeout
      }
    } = request

    return streamResponse(request, h, () => {
      return pipe(
        ipfs.dht.findProvs(cid, {
          numProviders,
          signal,
          timeout
        }),
        async function * (source) {
          yield * map(source, ({ id, addrs }) => {
            return {
              Responses: [{
                ID: id.toString(),
                Addrs: (addrs || []).map(a => a.toString())
              }],
              Type: 4
            }
          })
        }
      )
    })
  }
}

exports.get = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        buffer: Joi.binary().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'buffer', {
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
        buffer,
        timeout
      }
    } = request

    const res = await ipfs.dht.get(buffer, {
      signal,
      timeout
    })

    return h.response({
      Extra: res.toString(),
      Type: 5
    })
  }
}

exports.provide = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'cid', {
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
        cid,
        timeout
      }
    } = request

    await ipfs.dht.provide(cid, {
      signal,
      timeout
    })

    return h.response()
  }
}

exports.put = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().length(2).items(Joi.binary()).required(),
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
        arg: [
          key,
          value
        ],
        timeout
      }
    } = request

    await ipfs.dht.put(key, value, {
      signal,
      timeout
    })

    return h.response()
  }
}

exports.query = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peerId: Joi.string().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'peerId', {
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
        peerId,
        timeout
      }
    } = request

    return streamResponse(request, h, () => {
      return pipe(
        ipfs.dht.query(peerId, {
          signal,
          timeout
        }),
        async function * (source) {
          yield * map(source, ({ id }) => ({ ID: id.toString() }))
        }
      )
    })
  }
}
