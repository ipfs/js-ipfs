'use strict'

const isMultiaddr = require('mafmt').IPFS.matches

/**
 * @param {any} ma
 */
exports.isValidMultiaddr = ma => {
  try {
    return isMultiaddr(ma)
  } catch (err) {
    return false
  }
}
