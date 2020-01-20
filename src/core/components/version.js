'use strict'

const pkg = require('../../../package.json')

// TODO add the commit hash of the current ipfs version to the response.
module.exports = ({ repo }) => {
  return async function version () {
    const repoVersion = await repo.version.get()

    return {
      version: pkg.version,
      repo: repoVersion,
      commit: ''
    }
  }
}
