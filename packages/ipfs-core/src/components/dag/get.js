'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const first = require('it-first')
const last = require('it-last')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["get"]}
   */
  const get = async function get (ipfsPath, options = {}) {
    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (path) {
      options.path = path
    }

    if (options.preload !== false) {
      preload(cid)
    }

    if (options.path) {
      const entry = options.localResolve
        ? await first(ipld.resolve(cid, options.path))
        : await last(ipld.resolve(cid, options.path))
      /** @type {import('ipfs-core-types/src/dag').GetResult} - first and last will return undefined when empty */
      const result = (entry)
      return result
    }

    return {
      value: await ipld.get(cid, options),
      remainderPath: ''
    }
  }

  return withTimeoutOption(get)
}
