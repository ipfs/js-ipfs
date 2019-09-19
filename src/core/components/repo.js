'use strict'

const repoVersion = require('ipfs-repo').repoVersion
const callbackify = require('callbackify')

module.exports = function repo (self) {
  return {
    init: callbackify(async (bits, empty) => {
      // 1. check if repo already exists
    }),

    /**
     * If the repo has been initialized, report the current version.
     * Otherwise report the version that would be initialized.
     *
     * @param {function(Error, Number)} [callback]
     * @returns {undefined}
     */
    version: callbackify(async () => {
      try {
        await self._repo._checkInitialized()
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

      return self._repo.version.get()
    }),

    gc: require('./pin/gc')(self),

    stat: callbackify.variadic(async (options) => {
      options = options || {}

      const stats = await self._repo.stat(options)

      return {
        numObjects: stats.numObjects,
        repoSize: stats.repoSize,
        repoPath: stats.repoPath,
        version: stats.version.toString(),
        storageMax: stats.storageMax
      }
    }),

    path: () => self._repo.path
  }
}
