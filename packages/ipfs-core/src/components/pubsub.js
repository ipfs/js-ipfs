'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const errCode = require('err-code')
const { NotEnabledError } = require('../errors')
const get = require('dlv')

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('ipfs-core-types/src/config').Config} [config.config]
 */
module.exports = ({ network, config }) => {
  const isEnabled = get(config || {}, 'Pubsub.Enabled', true)

  return {
    subscribe: isEnabled ? withTimeoutOption(subscribe) : notEnabled,
    unsubscribe: isEnabled ? withTimeoutOption(unsubscribe) : notEnabled,
    publish: isEnabled ? withTimeoutOption(publish) : notEnabled,
    ls: isEnabled ? withTimeoutOption(ls) : notEnabled,
    peers: isEnabled ? withTimeoutOption(peers) : notEnabled
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API["subscribe"]}
   */
  async function subscribe (topic, handler, options = {}) {
    const { libp2p } = await network.use(options)
    // @ts-ignore Libp2p Pubsub is deprecating the handler, using the EventEmitter
    return libp2p.pubsub.subscribe(topic, handler, options)
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API["unsubscribe"]}
   */
  async function unsubscribe (topic, handler, options = {}) {
    const { libp2p } = await network.use(options)
    // @ts-ignore Libp2p Pubsub is deprecating the handler, using the EventEmitter
    libp2p.pubsub.unsubscribe(topic, handler, options)
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API["publish"]}
   */
  async function publish (topic, data, options = {}) {
    const { libp2p } = await network.use(options)
    if (!data) {
      throw errCode(new Error('argument "data" is required'), 'ERR_ARG_REQUIRED')
    }
    await libp2p.pubsub.publish(topic, data)
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API["ls"]}
   */
  async function ls (options = {}) {
    const { libp2p } = await network.use(options)
    return libp2p.pubsub.getTopics()
  }

  /**
   * @type {import('ipfs-core-types/src/pubsub').API["peers"]}
   */
  async function peers (topic, options = {}) {
    const { libp2p } = await network.use(options)
    return libp2p.pubsub.getSubscribers(topic)
  }
}

const notEnabled = async () => { // eslint-disable-line require-await
  throw new NotEnabledError('pubsub not enabled')
}
