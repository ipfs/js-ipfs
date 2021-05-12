'use strict'

const cp = require('./cp')
const rm = require('./rm')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} parents
 * @property {boolean} flush
 * @property {CIDVersion} cidVersion
 * @property {HashName} hashAlg
 * @property {number} shardSplitThreshold
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  parents: false,
  flush: true,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  shardSplitThreshold: 1000
}

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["mv"]}
   */
  async function mfsMv (from, to, options = {}) {
    /** @type {DefaultOptions} */
    const opts = mergeOptions(defaultOptions, options)

    await cp(context)(from, to, opts)
    await rm(context)(from, {
      ...opts,
      recursive: true
    })
  }

  return withTimeoutOption(mfsMv)
}
