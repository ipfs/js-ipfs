'use strict'

const pkg = require('../../../package.json')
const { withTimeoutOption } = require('../utils')

// TODO add the commit hash of the current ipfs version to the response.
/**
 * @typedef {import("ipfs-repo")} Repo
 * @typedef {import("../utils").WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} VersionConfig
 * @property {Repo} repo
 *
 * @param {VersionConfig} repo
 * @returns {Version}
 */
module.exports = ({ repo }) => {
  /**
   * @typedef {Object} VersionInfo
   * @property {string} version
   * @property {string} repoVersion
   * @property {string} commit
   *
   * @callback Version
   * @param {WithTimeoutOptions} [options]
   * @returns {VersionInfo}
   *
   * @type {Version}
   */
  async function version (options) {
    const repoVersion = await repo.version.get(options)

    return {
      version: pkg.version,
      repo: repoVersion,
      commit: ''
    }
  }

  return withTimeoutOption(version)
}
