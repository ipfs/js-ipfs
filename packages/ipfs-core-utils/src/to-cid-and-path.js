'use strict'

const CID = require('cids')
const errCode = require('err-code')

const IPFS_PREFIX = '/ipfs/'

const toCidAndPath = (string) => {
  if (Buffer.isBuffer(string)) {
    try {
      string = new CID(string)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }
  }

  if (CID.isCID(string)) {
    return {
      cid: string,
      path: undefined
    }
  }

  if (string.startsWith(IPFS_PREFIX)) {
    string = string.substring(IPFS_PREFIX.length)
  }

  const parts = string.split('/')
  let cid
  let path

  try {
    cid = new CID(parts.shift())
  } catch (err) {
    throw errCode(err, 'ERR_INVALID_CID')
  }

  if (parts.length) {
    path = `/${parts.join('/')}`
  }

  return {
    cid,
    path
  }
}

module.exports = toCidAndPath
