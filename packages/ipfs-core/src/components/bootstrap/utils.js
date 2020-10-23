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

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the added addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {import('..').Multiaddr} Multiaddr
 */
