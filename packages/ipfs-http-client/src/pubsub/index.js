'use strict'

const SubscriptionTracker = require('./subscription-tracker')

/**
 * @param {import('../types').Options} config
 */
module.exports = config => {
  config.subscriptionTracker = new SubscriptionTracker()

  return {
    ls: require('./ls')(config),
    peers: require('./peers')(config),
    publish: require('./publish')(config),
    subscribe: require('./subscribe')(config),
    unsubscribe: require('./unsubscribe')(config)
  }
}
