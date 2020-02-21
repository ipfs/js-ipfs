'use strict'

const { repoVersion } = require('ipfs-repo')

module.exports = ({ repo }) => {
  /**
   * If the repo has been initialized, report the current version.
   * Otherwise report the version that would be initialized.
   *
   * @returns {number}
   */
  return async function version () {
    try {
      await repo._checkInitialized()
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

    return repo.version.get()
  }
}
