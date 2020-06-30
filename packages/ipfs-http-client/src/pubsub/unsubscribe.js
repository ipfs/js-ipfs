'use strict'

const SubscriptionTracker = require('./subscription-tracker')

module.exports = api => {
  const subsTracker = SubscriptionTracker.singleton()
  // eslint-disable-next-line require-await
  return async (topic, handler) => subsTracker.unsubscribe(topic, handler)
}
