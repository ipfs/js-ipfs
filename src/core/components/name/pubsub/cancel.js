'use strict'

const { getPubsubRouting } = require('./utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Cancel a name subscription.
   *
   * @param {String} name subscription name.
   * @param {function(Error)} [callback]
   * @returns {Promise<{ canceled: boolean }>}
   */
  return function cancel (name) {
    const pubsub = getPubsubRouting(ipns, constructorOptions)
    return pubsub.cancel(name)
  }
}
