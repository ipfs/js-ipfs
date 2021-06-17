'use strict'

const Joi = require('../../utils/joi')
const all = require('it-all')
const multipart = require('../../utils/multipart-request-parser')
const Boom = require('@hapi/boom')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')
const streamResponse = require('../../utils/stream-response')
const pushable = require('it-pushable')

exports.subscribe = {
  options: {
    timeout: {
      socket: false
    },
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        topic: Joi.string().required()
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
        topic
      }
    } = request

    // request.raw.res.setHeader('x-chunked-output', '1')
    request.raw.res.setHeader('content-type', 'identity') // stop gzip from buffering, see https://github.com/hapijs/hapi/issues/2975
    // request.raw.res.setHeader('Trailer', 'X-Stream-Error')

    return streamResponse(request, h, () => {
      const output = pushable()

      /**
       * @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn}
       */
      const handler = (msg) => {
        output.push({
          from: uint8ArrayToString(uint8ArrayFromString(msg.from, 'base58btc'), 'base64pad'),
          data: uint8ArrayToString(msg.data, 'base64pad'),
          seqno: uint8ArrayToString(msg.seqno, 'base64pad'),
          topicIDs: msg.topicIDs
        })
      }

      // js-ipfs-http-client needs a reply, and go-ipfs does the same thing
      output.push({})

      const unsubscribe = () => {
        ipfs.pubsub.unsubscribe(topic, handler)
        output.end()
      }

      request.raw.res.once('close', unsubscribe)

      ipfs.pubsub.subscribe(topic, handler, {
        signal
      })
        .catch(err => output.end(err))

      return output
    })
  }
}

exports.publish = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'data',
      /**
       * @param {import('../../types').Request} request
       * @param {import('@hapi/hapi').ResponseToolkit} _h
       */
      method: async (request, _h) => {
        if (!request.payload) {
          throw Boom.badRequest('argument "data" is required')
        }

        let data

        for await (const part of multipart(request.raw.req)) {
          if (part.type === 'file') {
            data = Buffer.concat(await all(part.content))
          }
        }

        if (!data || data.byteLength === 0) {
          throw Boom.badRequest('argument "data" is required')
        }

        return data
      }
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        topic: Joi.string().required(),
        discover: Joi.boolean(),
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
      pre: {
        data
      },
      query: {
        topic,
        timeout
      }
    } = request

    try {
      await ipfs.pubsub.publish(topic, data, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: `Failed to publish to topic ${topic}` })
    }

    return h.response()
  }
}

exports.ls = {
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

    let subscriptions
    try {
      subscriptions = await ipfs.pubsub.ls({
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to list subscriptions' })
    }

    return h.response({ Strings: subscriptions })
  }
}

exports.peers = {
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

    let peers
    try {
      peers = await ipfs.pubsub.peers(topic, {
        signal,
        timeout
      })
    } catch (err) {
      const message = topic
        ? `Failed to find peers subscribed to ${topic}: ${err}`
        : `Failed to find peers: ${err}`

      throw Boom.boomify(err, { message })
    }

    return h.response({ Strings: peers })
  }
}
