'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 * @typedef {import('bignumber.js').BigNumber} BigNumber
 */

/**
 * @typedef {Object} RepoConfig
 * @property {*} repo
 *
 * @typedef {Object} RepoOptions
 * @property {boolean} [options]
 *
 * @typedef {Object} RepoStat
 * @property {BigNumber} numObjects
 * @property {BigNumber} repoSize
 * @property {BigNumber} storageMax
 * @property {string} repoPath
 * @property {string} version
 */

/**
 * @typedef {RepoOptions & WithTimeoutOptions} Options
 */

/**
 * @param {RepoConfig} config
 * @returns {Stat}
 */
module.exports = ({ repo }) => {
  /**
   * @callback Stat
   * @param {Options} [options]
   * @returns {Promise<RepoStat>}
   *
   * @type {Stat}
   */
  async function stat (options) {
    const stats = await repo.stat(options)

    return {
      numObjects: stats.numObjects,
      repoSize: stats.repoSize,
      repoPath: stats.repoPath,
      version: stats.version.toString(),
      storageMax: stats.storageMax
    }
  }

  return withTimeoutOption(stat)
}
