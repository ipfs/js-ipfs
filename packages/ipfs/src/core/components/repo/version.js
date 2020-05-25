'use strict'

const { repoVersion } = require('ipfs-repo')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-repo')} Repo
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} Config
 * @property {Repo} repo
 *
 * @param {Config} config
 * @returns {Version}
 */
module.exports = ({ repo }) => {
  /**
   * If the repo has been initialized, report the current version.
   * Otherwise report the version that would be initialized.
   * @callback Version
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<number>}
   * @type {Version}
   */
  async function version (options) {
    try {
      // @ts-ignore - private method not supposed to be used from outside.
      await repo._checkInitialized(options)
    } catch (err) {
      // TODO: (dryajov) This is really hacky, there must be a better way
      const match = [
        /Key not found in database \[\/version\]/,
        /ENOENT/,
        /repo is not initialized yet/
      ].some((m) => {
        return m.test(err.message)
      })
      if (match) {
        // this repo has not been initialized
        return repoVersion
      }
      throw err
    }

    return repo.version.get(options)
  }

  return withTimeoutOption(version)
}
