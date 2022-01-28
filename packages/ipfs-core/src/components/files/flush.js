import { createStat } from './stat.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import mergeOpts from 'merge-options'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

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
export function createFlush (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["flush"]}
   */
  async function mfsFlush (path, options = {}) {
    /** @type {DefaultOptions} */
    options = mergeOptions(defaultOptions, options)

    const { cid } = await createStat(context)(path, options)

    return cid
  }

  return withTimeoutOption(mfsFlush)
}
