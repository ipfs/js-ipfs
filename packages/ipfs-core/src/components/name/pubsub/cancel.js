'use strict'

const { getPubsubRouting } = require('./utils')
const { withTimeoutOption } = require('../../../utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Cancel a name subscription.
   *
   * @param {string} name - subscription name.
   * @param {object} [options]
   * @returns {Promise<{ canceled: boolean }>}
   */
  return withTimeoutOption(async function cancel (name, options) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, constructorOptions)
    return pubsub.cancel(name, options)
  })
}
