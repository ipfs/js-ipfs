'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @param {*} config
 * @returns {*}
 */
module.exports = ({ peerInfo }) => {
  return withTimeoutOption(async function localAddrs () { // eslint-disable-line require-await
    return peerInfo.multiaddrs.toArray()
  })
}
