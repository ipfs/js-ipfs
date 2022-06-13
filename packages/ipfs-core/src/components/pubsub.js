import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import errCode from 'err-code'
import { NotEnabledError } from '../errors.js'
import get from 'dlv'

/**
 * @typedef {import('@libp2p/interfaces/pubsub').Message} Message
 * @typedef {import('@libp2p/interfaces/events').EventHandler<CustomEvent<Message>>} EventHandler
 * @typedef {import('@libp2p/interfaces/events').EventHandler<Message>} MessageEventHandler
 */

/**
 * @param {object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('ipfs-core-types/src/config').Config} [config.config]
 */
export function createPubsub ({ network, config }) {
  const isEnabled = get(config || {}, 'Pubsub.Enabled', true)

  /** @type {Record<string, MessageEventHandler[]>} */
  const handlers = {}
  /** @type {EventHandler | undefined} */
  let onMessage

  return {
    subscribe: isEnabled ? withTimeoutOption(subscribe) : notEnabled,
    unsubscribe: isEnabled ? withTimeoutOption(unsubscribe) : notEnabled,
    publish: isEnabled ? withTimeoutOption(publish) : notEnabled,
    ls: isEnabled ? withTimeoutOption(ls) : notEnabled,
    peers: isEnabled ? withTimeoutOption(peers) : notEnabled
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["subscribe"]}
   */
  async function subscribe (topic, handler, options = {}) {
    const { libp2p } = await network.use(options)

    libp2p.pubsub.subscribe(topic)

    // listen for 'message' events if we aren't already
    if (onMessage == null) {
      onMessage = (evt) => {
        const msg = evt.detail

        if (handlers[msg.topic]) {
          handlers[msg.topic].forEach(handler => {
            if (typeof handler === 'function') {
              handler(msg)
              return
            }

            if (handler != null && handler.handleEvent != null) {
              handler.handleEvent(msg)
            }
          })
        }
      }

      libp2p.pubsub.addEventListener('message', onMessage)
    }

    // store handler for future invocation
    if (handler != null) {
      if (handlers[topic] == null) {
        handlers[topic] = []
      }

      handlers[topic].push(handler)
    }
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["unsubscribe"]}
   */
  async function unsubscribe (topic, handler, options = {}) {
    const { libp2p } = await network.use(options)

    // remove handler from local map
    if (handler != null && handlers[topic] != null) {
      handlers[topic] = handlers[topic].filter(h => h !== handler)

      if (handlers[topic].length === 0) {
        delete handlers[topic]
      }
    }

    // remove all handlers
    if (typeof handler !== 'function') {
      delete handlers[topic]
    }

    // no more handlers for this topic, unsubscribe
    if (handlers[topic] == null) {
      libp2p.pubsub.unsubscribe(topic)
    }

    // no more pubsub handlers, remove message listener
    if (Object.keys(handlers).length === 0) {
      libp2p.pubsub.removeEventListener('message', onMessage)
      onMessage = undefined
    }
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["publish"]}
   */
  async function publish (topic, data, options = {}) {
    const { libp2p } = await network.use(options)
    if (!data) {
      throw errCode(new Error('argument "data" is required'), 'ERR_ARG_REQUIRED')
    }

    await libp2p.pubsub.publish(topic, data)
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["ls"]}
   */
  async function ls (options = {}) {
    const { libp2p } = await network.use(options)

    return libp2p.pubsub.getTopics()
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["peers"]}
   */
  async function peers (topic, options = {}) {
    const { libp2p } = await network.use(options)

    return libp2p.pubsub.getSubscribers(topic)
  }
}

const notEnabled = async () => { // eslint-disable-line require-await
  throw new NotEnabledError('pubsub not enabled')
}
