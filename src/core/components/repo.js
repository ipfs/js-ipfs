'use strict'

const promisify = require('promisify-es6')
const repoVersion = require('ipfs-repo').repoVersion
const log = require('debug')('ipfs:repo')
const migrator = require('ipfs-repo-migrations')

module.exports = function repo (self) {
  return {
    init: (bits, empty, callback) => {
      // 1. check if repo already exists
    },

    /**
     * If the repo has been initialized, report the current version.
     * Otherwise report the version that would be initialized.
     *
     * @param {function(Error, Number)} [callback]
     * @returns {undefined}
     */
    version: promisify((callback) => {
      self._repo._isInitialized(err => {
        if (err) {
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
            return callback(null, repoVersion)
          }
          return callback(err)
        }

        self._repo.version.get(callback)
      })
    }),

    migrate: async function tryMigrateRepo () {
      // Reads the repo version from datastore, not from the ipfs-repo package
      const currentRepoVersion = await migrator.getCurrentRepoVersion(self._repo.path)

      if (currentRepoVersion >= repoVersion) {
        if (currentRepoVersion > repoVersion) {
          log('Your repo\'s version is higher then this version of js-ipfs require! You should revert it.')
        }

        return // Nothing to migrate
      }

      if (repoVersion > migrator.getLatestMigrationVersion()) {
        throw new Error('The ipfs-repo-migrations package does not have migration for version: ' + repoVersion)
      }

      return migrator.migrate(self._repo.path, repoVersion, true, self._repo.options)
    },

    gc: promisify((options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      callback(new Error('Not implemented'))
    }),

    stat: promisify((options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self._repo.stat(options, (err, stats) => {
        if (err) return callback(err)

        callback(null, {
          numObjects: stats.numObjects,
          repoSize: stats.repoSize,
          repoPath: stats.repoPath,
          version: stats.version.toString(),
          storageMax: stats.storageMax
        })
      })
    }),

    path: () => self._repo.path
  }
}
