import { createAddAll } from './add-all.js'
import last from 'it-last'
import { configure } from './lib/configure.js'
import { normaliseInput } from 'ipfs-core-utils/files/normalise-input-single'

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
      // @ts-expect-error - last may return undefined if source is empty
      return await last(all(normaliseInput(input), options))
    }
    return add
  })(options)
}
