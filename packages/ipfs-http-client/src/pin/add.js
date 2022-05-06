import { createAddAll } from './add-all.js'
import last from 'it-last'
import { configure } from '../lib/configure.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>} PinAPI
 */

/**
 * @param {import('../types').Options} config
 */
export function createAdd (config) {
  const all = createAddAll(config)

  return configure(() => {
    /**
     * @type {PinAPI["add"]}
     */
    async function add (path, options = {}) {
      // @ts-expect-error last can return undefined
      return last(all([{
        path,
        ...options
      }], options))
    }
    return add
  })(config)
}
