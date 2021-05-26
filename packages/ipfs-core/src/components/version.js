'use strict'

const pkg = require('../../package.json')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["version"]}
   */
  async function version (_options = {}) {
    const repoVersion = await repo.version.get()

    return {
      version: pkg.version,
      repo: `${repoVersion}`,

      // @ts-ignore gitHead is defined in published versions
      commit: pkg.gitHead || '',
      'interface-ipfs-core': pkg.devDependencies['interface-ipfs-core']
    }
  }

  return withTimeoutOption(version)
}
