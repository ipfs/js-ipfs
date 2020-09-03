'use strict'

const pkg = require('../../../package.json')
const { withTimeoutOption } = require('../utils')

module.exports = ({ repo }) => {
  return withTimeoutOption(async function version (options) {
    const repoVersion = await repo.version.get(options)

    return {
      version: pkg.version,
      repo: repoVersion,
      commit: pkg.gitHead || '', // is defined in published versions,
      'interface-ipfs-core': pkg.devDependencies['interface-ipfs-core'],
      'ipfs-http-client': pkg.dependencies['ipfs-http-client']
    }
  })
}
