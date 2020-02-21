'use strict'

const configure = require('../lib/configure')
const SubscriptionTracker = require('./subscription-tracker')

module.exports = configure(({ ky }) => {
  const subsTracker = SubscriptionTracker.singleton()
  // eslint-disable-next-line require-await
  return async (topic, handler) => subsTracker.unsubscribe(topic, handler)
})
