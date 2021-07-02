'use strict'

const { CID } = require('multiformats/cid')
const errCode = require('err-code')

const IPFS_PREFIX = '/ipfs/'

/**
 * @param {string|Uint8Array|CID} string
 * @returns {{cid:CID, path?:string}}
 */
const toCidAndPath = (string) => {
  if (string instanceof Uint8Array) {
    try {
      string = CID.decode(string)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }
  }

  if (string instanceof CID) {
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
    cid = CID.parse(parts.shift() || '')
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
