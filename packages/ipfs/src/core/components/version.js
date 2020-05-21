'use strict'

const pkg = require('../../../package.json')
const { withTimeoutOption } = require('../utils')

// TODO add the commit hash of the current ipfs version to the response.
/**
 * @typedef {import("ipfs-repo")} Repo
 * @typedef {Object} VersionConfig
 * @property {Repo} repo
 * 
 * @param {VersionConfig} repo
 */
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
