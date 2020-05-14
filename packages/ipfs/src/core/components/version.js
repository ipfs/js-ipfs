'use strict'

const pkg = require('../../../package.json')
const { withTimeoutOption } = require('../utils')

// TODO add the commit hash of the current ipfs version to the response.
module.exports = ({ repo }) => {
  return withTimeoutOption(async function version (options) {
    const repoVersion = await repo.version.get(options)

    return {
      version: pkg.version,
      repo: repoVersion,
      commit: ''
    }
  })
}
