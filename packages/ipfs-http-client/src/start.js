import { configure } from './lib/configure.js'
import errCode from 'err-code'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

export const createStart = configure(api => {
  /**
   * @type {RootAPI["start"]}
   */
  const start = async (options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return start
})
