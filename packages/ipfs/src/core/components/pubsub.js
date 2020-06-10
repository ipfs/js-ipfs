'use strict'

const { withTimeoutOption } = require('../utils')
const errCode = require('err-code')

module.exports = ({ libp2p }) => {
  return {
    subscribe: withTimeoutOption((...args) => libp2p.pubsub.subscribe(...args)),
    unsubscribe: withTimeoutOption((...args) => libp2p.pubsub.unsubscribe(...args)),
    publish: withTimeoutOption(async (topic, data, options) => {
      if (!data) {
        throw errCode(new Error('argument "data" is required'), 'ERR_ARG_REQUIRED')
      }
      await libp2p.pubsub.publish(topic, data)
    }),
    ls: withTimeoutOption((...args) => libp2p.pubsub.getTopics(...args)),
    peers: withTimeoutOption((...args) => libp2p.pubsub.getSubscribers(...args))
  }
}
