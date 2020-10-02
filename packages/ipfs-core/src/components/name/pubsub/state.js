'use strict'

const { getPubsubRouting } = require('./utils')
const { withTimeoutOption } = require('../../../utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Query the state of IPNS pubsub.
   *
   * @returns {Promise<boolean>}
   */
  return withTimeoutOption(async function state (options) { // eslint-disable-line require-await
    try {
      return { enabled: Boolean(getPubsubRouting(ipns, constructorOptions)) }
    } catch (err) {
      return false
    }
  })
}
