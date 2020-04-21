'use strict'

const { withTimeoutOption } = require('../utils')

module.exports = ({ libp2p }) => {
  return {
    subscribe: withTimeoutOption((...args) => libp2p.pubsub.subscribe(...args)),
    unsubscribe: withTimeoutOption((...args) => libp2p.pubsub.unsubscribe(...args)),
    publish: withTimeoutOption((...args) => libp2p.pubsub.publish(...args)),
    ls: withTimeoutOption((...args) => libp2p.pubsub.getTopics(...args)),
    peers: withTimeoutOption((...args) => libp2p.pubsub.getSubscribers(...args))
  }
}
