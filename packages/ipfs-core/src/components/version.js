'use strict'

const pkg = require('../../package.json')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

// gitHead is defined in published versions
const meta = { gitHead: '', ...pkg }

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * Returns the implementation version
   *
   * @param {import('.').AbortOptions} [options]
   * @returns {Promise<Version>}
   * @example
   * ```js
   * const version = await ipfs.version()
   * console.log(version)
   * ```
   */
  async function version (options) {
    const repoVersion = await repo.version.get(options)

    return {
      version: meta.version,
      repo: repoVersion,
      commit: meta.gitHead,
      'interface-ipfs-core': meta.devDependencies['interface-ipfs-core']
    }
  }

  return withTimeoutOption(version)
}

/**
 * @typedef {object} Version
 * An object with the version information for the implementation,
 * the commit and the Repo. `js-ipfs` instances will also return
 * the version of `interface-ipfs-core` and `ipfs-http-client`
 * supported by this node
 *
 * @property {string} version
 * @property {number} repo
 * @property {string} [commit]
 * @property {string} [interface-ipfs-core]
 * @property {string} [ipfs-http-client]
 */
