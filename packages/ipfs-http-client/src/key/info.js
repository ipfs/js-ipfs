import { configure } from '../lib/configure.js'
import errCode from 'err-code'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

export const createInfo = configure(api => {
  /**
   * @type {KeyAPI["info"]}
   */
  const info = async (name, options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return info
})
