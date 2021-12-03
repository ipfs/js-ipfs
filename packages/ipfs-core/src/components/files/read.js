import { exporter } from 'ipfs-unixfs-exporter'
import mergeOpts from 'merge-options'
import { toMfsPath } from './utils/to-mfs-path.js'
import errCode from 'err-code'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

/**
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {number} offset
 * @property {number} length
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  offset: 0,
  length: Infinity
}

/**
 * @param {MfsContext} context
 */
export function createRead (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["read"]}
   */
  function mfsRead (path, options = {}) {
    /** @type {DefaultOptions} */
    options = mergeOptions(defaultOptions, options)

    return {
      [Symbol.asyncIterator]: async function * read () {
        const mfsPath = await toMfsPath(context, path, options)
        const result = await exporter(mfsPath.mfsPath, context.repo.blocks)

        if (result.type !== 'file') {
          throw errCode(new Error(`${path} was not a file`), 'ERR_NOT_FILE')
        }

        if (!result.content) {
          throw errCode(new Error(`Could not load content stream from ${path}`), 'ERR_NO_CONTENT')
        }

        for await (const buf of result.content({
          offset: options.offset,
          length: options.length
        })) {
          yield buf
        }
      }
    }
  }

  return withTimeoutOption(mfsRead)
}
