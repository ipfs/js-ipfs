import Joi from '../../utils/joi.js'
import { streamResponse } from '../../utils/stream-response.js'
import { TimeoutController } from 'timeout-abort-controller'
import { anySignal } from 'any-signal'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import all from 'it-all'
import Boom from '@hapi/boom'

/**
 * @typedef {import('ipfs-core-types/src/dht').QueryEvent} QueryEvent
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 */

/**
 * @param {QueryEvent} event
 */
function mapQueryEvent (event) {
  let id
  let extra = ''
  const type = event.type
  let responses = null

  if (event.name === 'PEER_RESPONSE') {
    id = event.from.toString()
    responses = event.closer.map(peerData => ({
      ID: peerData.id,
      Addrs: peerData.multiaddrs
    }))
  } else if (event.name === 'QUERY_ERROR') {
    extra = event.error.message
  } else if (event.name === 'PROVIDER') {
    responses = event.providers.map(peerData => ({
      ID: peerData.id,
      Addrs: peerData.multiaddrs
    }))
  } else if (event.name === 'VALUE') {
    extra = uint8ArrayToString(event.value, 'base64pad')
  } else if (event.name === 'ADDING_PEER') {
    responses = [{
      ID: event.peer,
      Addrs: []
    }]
  } else if (event.name === 'DIALING_PEER') {
    id = event.peer.toString()
  } else if (event.name === 'FINAL_PEER') {
    id = event.peer.id.toString()
    responses = [{
      ID: event.peer.id,
      Addrs: event.peer.multiaddrs
    }]
  }

  return {
    Extra: extra,
    ID: id,
    Type: type,
    Responses: responses
  }
}

export const findPeerResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peerId: Joi.peerId().required(),
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

    const signals = [signal]
    /** @type {TimeoutController | undefined} */
    let timeoutController

    if (timeout != null) {
      timeoutController = new TimeoutController(timeout)
      signals.push(timeoutController.signal)
    }

    return streamResponse(request, h, () => {
      return (async function * () {
        for await (const event of ipfs.dht.findPeer(peerId, {
          signal: anySignal(signals)
        })) {
          yield mapQueryEvent(event)
        }

        if (timeoutController) {
          timeoutController.clear()
        }
      }())
    })
  }
}

export const findProvsResource = {
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
        numProviders,
        timeout
      }
    } = request

    const signals = [signal]
    /** @type {TimeoutController | undefined} */
    let timeoutController

    if (timeout != null) {
      timeoutController = new TimeoutController(timeout)
      signals.push(timeoutController.signal)
    }

    const providers = new Set()

    return streamResponse(request, h, () => {
      return (async function * () {
        for await (const event of ipfs.dht.findProvs(cid, {
          signal: anySignal(signals)
        })) {
          if (event.name === 'PROVIDER') {
            event.providers.forEach(peerData => {
              providers.add(peerData.id)
            })
          }

          yield mapQueryEvent(event)

          if (providers.size >= numProviders) {
            break
          }
        }

        if (timeoutController) {
          timeoutController.clear()
        }
      }())
    })
  }
}

export const getResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        key: Joi.string().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'key', {
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
        key,
        timeout
      }
    } = request

    const signals = [signal]
    /** @type {TimeoutController | undefined} */
    let timeoutController

    if (timeout != null) {
      timeoutController = new TimeoutController(timeout)
      signals.push(timeoutController.signal)
    }

    return streamResponse(request, h, () => {
      return (async function * () {
        for await (const event of ipfs.dht.get(key, {
          signal: anySignal(signals)
        })) {
          yield mapQueryEvent(event)
        }

        if (timeoutController) {
          timeoutController.clear()
        }
      }())
    })
  }
}

export const provideResource = {
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

    const signals = [signal]
    /** @type {TimeoutController | undefined} */
    let timeoutController

    if (timeout != null) {
      timeoutController = new TimeoutController(timeout)
      signals.push(timeoutController.signal)
    }

    return streamResponse(request, h, () => {
      return (async function * () {
        for await (const event of ipfs.dht.provide(cid, {
          signal: anySignal(signals)
        })) {
          yield mapQueryEvent(event)
        }

        if (timeoutController) {
          timeoutController.clear()
        }
      }())
    })
  }
}

export const putResource = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      /**
       * @param {import('../../types').Request} request
       * @param {import('@hapi/hapi').ResponseToolkit} _h
       */
      method: async (request, _h) => {
        if (!request.payload) {
          throw Boom.badRequest("Argument 'file' is required")
        }

        let value

        for await (const part of multipartRequestParser(request.raw.req)) {
          if (part.type !== 'file') {
            continue
          }

          value = Buffer.concat(await all(part.content))
        }

        if (!value) {
          throw Boom.badRequest("Argument 'file' is required")
        }

        try {
          return { value }
        } catch (/** @type {any} */ err) {
          throw Boom.boomify(err, { message: 'Failed to decode file as config' })
        }
      }
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        key: Joi.string().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'key', {
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
        args: {
          value
        }
      },
      query: {
        key,
        timeout
      }
    } = request

    const signals = [signal]
    /** @type {TimeoutController | undefined} */
    let timeoutController

    if (timeout != null) {
      timeoutController = new TimeoutController(timeout)
      signals.push(timeoutController.signal)
    }

    return streamResponse(request, h, () => {
      return (async function * () {
        for await (const event of ipfs.dht.put(key, value, {
          signal: anySignal(signals)
        })) {
          yield mapQueryEvent(event)
        }

        if (timeoutController) {
          timeoutController.clear()
        }
      }())
    })
  }
}

export const queryResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        key: Joi.string().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'key', {
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
        key,
        timeout
      }
    } = request

    const signals = [signal]
    /** @type {TimeoutController | undefined} */
    let timeoutController

    if (timeout != null) {
      timeoutController = new TimeoutController(timeout)
      signals.push(timeoutController.signal)
    }

    return streamResponse(request, h, () => {
      return (async function * () {
        for await (const event of ipfs.dht.query(key, {
          signal: anySignal(signals)
        })) {
          yield mapQueryEvent(event)
        }

        if (timeoutController) {
          timeoutController.clear()
        }
      }())
    })
  }
}
