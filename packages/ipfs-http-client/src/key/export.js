import { configure } from '../lib/configure.js'
import errCode from 'err-code'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

export const createExport = configure(api => {
  /**
   * @type {KeyAPI["export"]}
   */
  const exportKey = async (name, password, options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return exportKey
})
