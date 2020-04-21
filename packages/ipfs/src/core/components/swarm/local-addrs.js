'use strict'

module.exports = ({ multiaddrs }) => {
  return async function localAddrs () { // eslint-disable-line require-await
    return multiaddrs
  }
}
