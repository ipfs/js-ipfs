'use strict'

const isMultiaddr = require('mafmt').IPFS.matches

exports.isValidMultiaddr = ma => {
  try {
    return isMultiaddr(ma)
  } catch (err) {
    return false
  }
}
