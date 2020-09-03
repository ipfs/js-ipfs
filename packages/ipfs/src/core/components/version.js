'use strict'

const pkg = require('../../../package.json')
const { withTimeoutOption } = require('../utils')

/**
 * @typedef {object} VersionObj - An object with the version of the implementation, the commit and the Repo. `js-ipfs` instances will also return the version of `interface-ipfs-core` and `ipfs-http-client` supported by this node
 * @property {string} version
 * @property {string} repo
 * @property {string} [commit]
 * @property {string} [interface-ipfs-core]
 * @property {string} [ipfs-http-client]
 */

/**
 * Returns the implementation version
 * @template {Record<string, any>} ExtraOptions
 * @callback Version
 * @param {import('../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<VersionObj>}
 */

module.exports = ({ repo }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {Version<{}>}
   */
  async function version (options) {
    const repoVersion = await repo.version.get(options)

    return {
      version: pkg.version,
      repo: repoVersion,
      commit: pkg.gitHead || '', // is defined in published versions,
      'interface-ipfs-core': pkg.devDependencies['interface-ipfs-core'],
      'ipfs-http-client': pkg.dependencies['ipfs-http-client']
    }
  }

  return withTimeoutOption(version)
}
