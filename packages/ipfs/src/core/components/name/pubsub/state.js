'use strict'

const { getPubsubRouting } = require('./utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Query the state of IPNS pubsub.
   *
   * @returns {Promise<boolean>}
   */
  return async function state () { // eslint-disable-line require-await
    try {
      return { enabled: Boolean(getPubsubRouting(ipns, constructorOptions)) }
    } catch (err) {
      return false
    }
  }
}
