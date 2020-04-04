'use strict'

const configure = require('./lib/configure')
const SubscriptionTracker = require('./pubsub/subscription-tracker')

module.exports = configure(api => {
  return async (options = {}) => {
    // emit unsubscribe all topic for make is really stop
    SubscriptionTracker.singleton().unsubscribeAll()
    return (await api.post('shutdown', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).text()
  }
})
