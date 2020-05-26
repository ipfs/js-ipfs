'use strict'

const { withTimeoutOption } = require('../utils')

/**
 * @typedef {import('./init').LibP2P} LibP2P
 * @typedef {import('ipfs-interface').Subscriber} Subscriber
 *
 * @typedef {Object} PubSub
 * @property {GetSubscribers} peers
 * @property {Unsubscribe} unsubscribe
 * @property {Subscribe} subscribe
 * @property {GetTopis} ls
 * @property {Publish} publish
 */

/**
 * @callback GetSubscribers
 * @param {string} topic
 * @returns {string[]}
 */

/**
 * @callback GetTopis
 * @returns {string[]}
 */

/**
 * @callback Publish
 * @param {string} topic
 * @param {Buffer} data
 * @returns {Promise<void>}
 */

 /**
  * @callback Subscribe
  * @param {string} topic
  * @param {Subscriber} handler
  * @returns {void}
  */

/**
 * @callback Unsubscribe
 * @param {string} topic
 * @param {Subscriber} handler
 * @returns {void}
 */

/**
 * @typedef {Object} Config
 * @property {LibP2P} libp2p
 *
 * @param {Config} config
 * @returns {PubSub}
 */
module.exports = ({ libp2p }) => {
  return {
    subscribe: withTimeoutOption((...args) => libp2p.pubsub.subscribe(...args)),
    unsubscribe: withTimeoutOption((...args) => libp2p.pubsub.unsubscribe(...args)),
    publish: withTimeoutOption((...args) => libp2p.pubsub.publish(...args)),
    ls: withTimeoutOption((...args) => libp2p.pubsub.getTopics(...args)),
    peers: withTimeoutOption((...args) => libp2p.pubsub.getSubscribers(...args))
  }
}
