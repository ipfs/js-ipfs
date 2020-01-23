'use strict'

const { getPubsubRouting } = require('./utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Show current name subscriptions.
   *
   * @param {function(Error)} [callback]
   * @returns {Promise<string[]>}
   */
  return async function subs () { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, constructorOptions)
    return pubsub.getSubscriptions()
  }
}
