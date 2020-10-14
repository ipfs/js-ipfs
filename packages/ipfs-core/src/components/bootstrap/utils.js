'use strict'

const isMultiaddr = require('mafmt').IPFS.matches

/**
 * @param {any} ma
 * @returns {boolean}
 */
exports.isValidMultiaddr = ma => {
  try {
    return isMultiaddr(ma)
  } catch (err) {
    return false
  }
}
