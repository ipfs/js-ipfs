'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const errCode = require('err-code')
const { NotEnabledError } = require('../errors')
const get = require('dlv')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 * @param {import('.').IPFSConfig} [config.config]
 */
module.exports = ({ network, config }) => {
  const isEnabled = get(config, 'Pubsub.Enabled', true)

  return {
    subscribe: isEnabled ? withTimeoutOption(subscribe) : notEnabled,
    unsubscribe: isEnabled ? withTimeoutOption(unsubscribe) : notEnabled,
    publish: isEnabled ? withTimeoutOption(publish) : notEnabled,
    ls: isEnabled ? withTimeoutOption(ls) : notEnabled,
    peers: isEnabled ? withTimeoutOption(peers) : notEnabled
  }

  /**
   * Subscribe to a pubsub topic.
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   * const receiveMsg = (msg) => console.log(msg.data.toString())
   *
   * await ipfs.pubsub.subscribe(topic, receiveMsg)
   * console.log(`subscribed to ${topic}`)
   * ```
   *
   * @param {string} topic - The topic name
   * @param {(message:Message) => void} handler - Event handler which will be
   * called with a message object everytime one is received.
   * @param {AbortOptions} [options]
   * @returns {Promise<void>}
   */
  async function subscribe (topic, handler, options) {
    const { libp2p } = await network.use(options)
    // @ts-ignore Libp2p Pubsub is deprecating the handler, using the EventEmitter
    return libp2p.pubsub.subscribe(topic, handler, options)
  }

  /**
   * Unsubscribes from a pubsub topic.
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   * const receiveMsg = (msg) => console.log(msg.toString())
   *
   * await ipfs.pubsub.subscribe(topic, receiveMsg)
   * console.log(`subscribed to ${topic}`)
   *
   * await ipfs.pubsub.unsubscribe(topic, receiveMsg)
   * console.log(`unsubscribed from ${topic}`)
   *
   * // Or removing all listeners:
   *
   * const topic = 'fruit-of-the-day'
   * const receiveMsg = (msg) => console.log(msg.toString())
   * await ipfs.pubsub.subscribe(topic, receiveMsg);
   * // Will unsubscribe ALL handlers for the given topic
   * await ipfs.pubsub.unsubscribe(topic);
   * ```
   *
   * @param {string} topic - The topic to unsubscribe from
   * @param {(message:Message) => void} [handler] - The handler to remove. If
   * not provided unsubscribes al handlers for the topic.
   * @param {AbortOptions} [options]
   * @returns {Promise<void>}
   */
  async function unsubscribe (topic, handler, options) {
    const { libp2p } = await network.use(options)
    // @ts-ignore Libp2p Pubsub is deprecating the handler, using the EventEmitter
    libp2p.pubsub.unsubscribe(topic, handler, options)
  }

  /**
   * Publish a data message to a pubsub topic.
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   * const msg = new TextEncoder().encode('banana')
   *
   * await ipfs.pubsub.publish(topic, msg)
   * // msg was broadcasted
   * console.log(`published to ${topic}`)
   * ```
   *
   * @param {string} topic
   * @param {Uint8Array} data
   * @param {AbortOptions} options
   * @returns {Promise<void>}
   */
  async function publish (topic, data, options) {
    const { libp2p } = await network.use(options)
    if (!data) {
      throw errCode(new Error('argument "data" is required'), 'ERR_ARG_REQUIRED')
    }
    await libp2p.pubsub.publish(topic, data)
  }
  /**
   * Returns the list of subscriptions the peer is subscribed to.
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<string[]>}
   */
  async function ls (options) {
    const { libp2p } = await network.use(options)
    return libp2p.pubsub.getTopics()
  }

  /**
   * Returns the peers that are subscribed to one topic.
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   *
   * const peerIds = await ipfs.pubsub.peers(topic)
   * console.log(peerIds)
   * ```
   *
   * @param {string} topic
   * @param {AbortOptions} [options]
   * @returns {Promise<string[]>} - An array of peer IDs subscribed to the topic
   */
  async function peers (topic, options) {
    const { libp2p } = await network.use(options)
    return libp2p.pubsub.getSubscribers(topic)
  }
}

const notEnabled = async () => { // eslint-disable-line require-await
  throw new NotEnabledError('pubsub not enabled')
}

/**
 * @typedef {Object} Message
 * @property {string} from
 * @property {Uint8Array} seqno
 * @property {Uint8Array} data
 * @property {string[]} topicIDs
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
