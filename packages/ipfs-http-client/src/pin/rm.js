import { createRmAll } from './rm-all.js'
import last from 'it-last'
import { configure } from '../lib/configure.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>} PinAPI
 */

/**
 * @param {import('../types').Options} config
 */
export const createRm = (config) => {
  const all = createRmAll(config)

  return configure(() => {
    /**
     * @type {PinAPI["rm"]}
     */
    async function rm (path, options = {}) {
      // @ts-expect-error last can return undefined
      return last(all([{
        path,
        ...options
      }], options))
    }
    return rm
  })(config)
}
