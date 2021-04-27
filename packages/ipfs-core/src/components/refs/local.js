'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = function ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/refs').API["local"]}
   */
  async function * refsLocal (options = {}) {
    for await (const cid of repo.blocks.queryKeys({}, { signal: options.signal })) {
      yield { ref: cid.toString() }
    }
  }

  return withTimeoutOption(refsLocal)
}
