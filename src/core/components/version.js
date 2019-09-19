'use strict'

const pkg = require('../../../package.json')
const callbackify = require('callbackify')

// TODO add the commit hash of the current ipfs version to the response.
module.exports = function version (self) {
  return callbackify(async () => {
    const repoVersion = await self.repo.version()

    return {
      version: pkg.version,
      repo: repoVersion,
      commit: ''
    }
  })
}
