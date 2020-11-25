'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = function ({ repo }) {
  /**
   * @param {import('.').AbortOptions} [options]
   * @returns {AsyncIterable<{ref: string}>}
   */
  async function * refsLocal (options = {}) {
    // @ts-ignore - TS is not aware of keysOnly
    for await (const cid of repo.blocks.query({ keysOnly: true, signal: options.signal })) {
      yield { ref: cid.toString() }
    }
  }

  return withTimeoutOption(refsLocal)
}
