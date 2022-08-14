import Joi from '../../utils/joi.js'
import all from 'it-all'
import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import Boom from '@hapi/boom'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { streamResponse } from '../../utils/stream-response.js'
import { pushable } from 'it-pushable'
import { base64url } from 'multiformats/bases/base64'

/**
 * @typedef {import('@libp2p/interface-pubsub').Message} Message
 */

const preDecodeTopicFromHttpRpc = {
  assign: 'topic',
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} _h
   */
  method: async (request, _h) => {
    try {
      return uint8ArrayToString(base64url.decode(request.query.topic))
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: `Failed to decode topic  from HTTP RPC form ${request.query.topic}` })
    }
  }
}

export const subscribeResource = {
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
    },
    pre: [preDecodeTopicFromHttpRpc]
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
        topic // decoded version created by preDecodeTopicFromHttpRpc
      }
    } = request

    // request.raw.res.setHeader('x-chunked-output', '1')
    request.raw.res.setHeader('content-type', 'identity') // stop gzip from buffering, see https://github.com/hapijs/hapi/issues/2975
    // request.raw.res.setHeader('Trailer', 'X-Stream-Error')

    return streamResponse(request, h, () => {
      const output = pushable({ objectMode: true })

      /**
       * @type {import('@libp2p/interfaces/events').EventHandler<Message>}
       */
      const handler = (msg) => {
        if (msg.type === 'signed') {
          let numberString = msg.sequenceNumber.toString(16)

          if (numberString.length % 2 !== 0) {
            numberString = `0${numberString}`
          }

          const sequenceNumber = base64url.encode(uint8ArrayFromString(numberString, 'base16'))

          output.push({
            from: msg.from, // TODO: switch to peerIdFromString(msg.from).toString() when go-ipfs defaults to CIDv1
            data: base64url.encode(msg.data),
            seqno: sequenceNumber,
            topicIDs: [base64url.encode(uint8ArrayFromString(msg.topic))],
            key: base64url.encode(msg.key),
            signature: base64url.encode(msg.signature)
          })
        } else {
          output.push({
            data: base64url.encode(msg.data),
            topicIDs: [base64url.encode(uint8ArrayFromString(msg.topic))]
          })
        }
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

export const publishResource = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [preDecodeTopicFromHttpRpc, {
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

        for await (const part of multipartRequestParser(request.raw.req)) {
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
        topic,
        data
      },
      query: {
        timeout
      }
    } = request

    try {
      await ipfs.pubsub.publish(topic, data, {
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: `Failed to publish to topic ${topic}` })
    }

    return h.response()
  }
}

export const lsResource = {
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
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to list subscriptions' })
    }

    return h.response({ Strings: subscriptions.map(s => base64url.encode(uint8ArrayFromString(s))) })
  }
}

export const peersResource = {
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
    },
    pre: [preDecodeTopicFromHttpRpc]
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
        topic
      },
      query: {
        timeout
      }
    } = request

    let peers
    try {
      peers = await ipfs.pubsub.peers(topic, {
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      const message = topic
        ? `Failed to find peers subscribed to ${topic}: ${err}`
        : `Failed to find peers: ${err}`

      throw Boom.boomify(err, { message })
    }

    return h.response({ Strings: peers })
  }
}
