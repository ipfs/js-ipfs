
import { createAddAll } from './add-all.js'
import last from 'it-last'
import { configure } from './lib/configure.js'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

/**
 * @param {import('./types').Options} options
 */
export function createAdd (options) {
  const all = createAddAll(options)
  return configure(() => {
    /**
     * @type {RootAPI["add"]}
     */
    async function add (input, options = {}) {
      // @ts-ignore - last may return undefined if source is empty
      return await last(all(input, options))
    }
    return add
  })(options)
}
