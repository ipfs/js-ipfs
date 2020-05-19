'use strict'

const Joi = require('../../utils/joi')
const PassThrough = require('stream').PassThrough
const bs58 = require('bs58')
const binaryQueryString = require('binary-querystring')
const Boom = require('@hapi/boom')

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
        from: bs58.decode(msg.from).toString('base64'),
        data: msg.data.toString('base64'),
        seqno: msg.seqno.toString('base64'),
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
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        args: Joi.array().ordered(
          Joi.string().required(),
          Joi.binary().min(1).required()
        ).required(),
        discover: Joi.boolean(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'args', {
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
        args: [
          topic
        ],
        timeout
      }
    } = request

    const rawArgs = binaryQueryString(request.url.search)
    const buf = rawArgs.arg && rawArgs.arg[1]

    try {
      await ipfs.pubsub.publish(topic, buf, {
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
