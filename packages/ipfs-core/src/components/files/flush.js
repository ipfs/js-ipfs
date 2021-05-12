'use strict'

const stat = require('./stat')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

/**
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {}

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["flush"]}
   */
  async function mfsFlush (path, options = {}) {
    /** @type {DefaultOptions} */
    options = mergeOptions(defaultOptions, options)

    const { cid } = await stat(context)(path, options)

    return cid
  }

  return withTimeoutOption(mfsFlush)
}
