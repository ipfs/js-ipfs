'use strict'

module.exports = ({ libp2p }) => {
  return {
    subscribe: (...args) => libp2p.pubsub.subscribe(...args),
    unsubscribe: (...args) => libp2p.pubsub.unsubscribe(...args),
    publish: (...args) => libp2p.pubsub.publish(...args),
    ls: (...args) => libp2p.pubsub.getTopics(...args),
    peers: (...args) => libp2p.pubsub.getSubscribers(...args)
  }
}
