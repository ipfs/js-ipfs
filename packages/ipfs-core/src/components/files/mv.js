import { createCp } from './cp.js'
import { createRm } from './rm.js'
import mergeOpts from 'merge-options'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

/**
 * @typedef {import('multiformats/cid').CIDVersion} CIDVersion
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} parents
 * @property {boolean} flush
 * @property {CIDVersion} cidVersion
 * @property {string} hashAlg
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
export function createMv (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["mv"]}
   */
  async function mfsMv (from, to, options = {}) {
    /** @type {DefaultOptions} */
    const opts = mergeOptions(defaultOptions, options)

    await createCp(context)(from, to, opts)
    await createRm(context)(from, {
      ...opts,
      recursive: true
    })
  }

  return withTimeoutOption(mfsMv)
}
