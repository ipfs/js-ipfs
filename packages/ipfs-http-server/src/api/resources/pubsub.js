'use strict'

const Joi = require('../../utils/joi')
const PassThrough = require('stream').PassThrough
const all = require('it-all')
const multipart = require('../../utils/multipart-request-parser')
const Boom = require('@hapi/boom')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

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
        topic: Joi.string().required(),
        discover: Joi.boolean()
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
        discover
      }
    } = request
    const res = new PassThrough({ highWaterMark: 1 })

    const handler = (msg) => {
      res.write(JSON.stringify({
        from: uint8ArrayToString(uint8ArrayFromString(msg.from, 'base58btc'), 'base64pad'),
        data: uint8ArrayToString(msg.data, 'base64pad'),
        seqno: uint8ArrayToString(msg.seqno, 'base64pad'),
        topicIDs: msg.topicIDs
      }) + '\n', 'utf8')
    }

    // js-ipfs-http-client needs a reply, and go-ipfs does the same thing
    res.write('{}\n')

    const unsubscribe = () => {
      ipfs.pubsub.unsubscribe(topic, handler)
      res.end()
    }

    request.events.once('disconnect', unsubscribe)
    request.events.once('finish', unsubscribe)

    await ipfs.pubsub.subscribe(topic, handler, {
      discover: discover,
      signal
    })

    return h.response(res)
      .header('X-Chunked-Output', '1')
      .header('content-encoding', 'identity') // stop gzip from buffering, see https://github.com/hapijs/hapi/issues/2975
      .header('content-type', 'application/json')
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
      method: async (request, h) => {
        if (!request.payload) {
          throw Boom.badRequest('argument "data" is required')
        }

        let data

        for await (const part of multipart(request)) {
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
