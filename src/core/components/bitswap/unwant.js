'use strict'

const CID = require('cids')
const errCode = require('err-code')

module.exports = ({ bitswap }) => {
  return async function unwant (keys) { // eslint-disable-line require-await
    if (!Array.isArray(keys)) {
      keys = [keys]
    }

    try {
      keys = keys.map((key) => new CID(key))
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    return bitswap.unwant(keys)
  }
}
