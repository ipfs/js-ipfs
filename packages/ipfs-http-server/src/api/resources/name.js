'use strict'

const Joi = require('../../utils/joi')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const last = require('it-last')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

exports.resolve = {
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
      map(value => ({ Path: value })),
      ndjson.stringify
    ))
  }
}

exports.publish = {
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

exports.pubsub = {
  state: {
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
  },
  subs: {
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
  },
  cancel: {
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
}
