'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const stat = require('./stat')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('../init').IPFSRepo} Repo
 * @typedef {import('../index').Block} Block
 */
/**
 * @typedef {Object} Context
 * @property {IPLD} ipld
 * @property {Block} block
 * @property {Repo} repo
 *
 * @typedef {WithTimeoutOptions} FlushOptions
 *
 * @param {Context} context
 * @returns {Flush}
*/
module.exports = (context) => {
  /**
   * @callback Flush
   * @param {string} [path]
   * @param {FlushOptions} [options]
   * @returns {Promise<CID>}
   *
   * @type {Flush}
   */
  async function mfsFlush (path = '/', options = defaultOptions) {
    if (path && typeof path !== 'string') {
      options = path
      path = '/'
    }

    options = applyDefaultOptions(options, defaultOptions)

    const result = await stat(context)(path, options)

    return result.cid
  }

  return withTimeoutOption(mfsFlush)
}
