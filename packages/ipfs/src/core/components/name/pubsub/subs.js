'use strict'

const { getPubsubRouting } = require('./utils')
const { withTimeoutOption } = require('../../../utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Show current name subscriptions.
   *
   * @param {function(Error)} [callback]
   * @returns {Promise<string[]>}
   */
  return withTimeoutOption(async function subs (options) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, constructorOptions)
    return pubsub.getSubscriptions(options)
  })
}
