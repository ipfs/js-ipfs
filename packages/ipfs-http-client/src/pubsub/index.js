'use strict'

const SubscriptionTracker = require('./subscription-tracker')

/**
 * @param {import('../types').Options} config
 */
module.exports = config => {
  const subscriptionTracker = new SubscriptionTracker()

  return {
    ls: require('./ls')(config),
    peers: require('./peers')(config),
    publish: require('./publish')(config),
    subscribe: require('./subscribe')(config, subscriptionTracker),
    unsubscribe: require('./unsubscribe')(config, subscriptionTracker)
  }
}
