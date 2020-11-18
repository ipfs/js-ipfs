'use strict'

const stat = require('./stat')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

const defaultOptions = {
  timeout: undefined,
  signal: undefined
}

module.exports = (context) => {
  /**
   * Flush a given path's data to disk
   *
   * @param {string} path
   * @param {AbortOptions} [options]
   * @returns {Promise<CID>} The CID of the path that has been flushed
   */
  async function mfsFlush (path, options = {}) {
    options = mergeOptions(defaultOptions, options)

    const { cid } = await stat(context)(path, options)

    return cid
  }

  return withTimeoutOption(mfsFlush)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */
