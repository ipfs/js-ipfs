'use strict'

const waterfall = require('async/waterfall')
const RepoErrors = require('ipfs-repo').errors

// Boot an IPFS node depending on the options set
module.exports = (self) => {
  self.log('booting')
  const options = self._options
  const doInit = options.init
  const doStart = options.start
  const repoOpen = !self._repo.closed

  const customInitOptions = typeof options.init === 'object' ? options.init : {}
  const initOptions = Object.assign({ bits: 2048, pass: self._options.pass }, customInitOptions)

  // Checks if a repo exists, and if so opens it
  // Will return callback with a bool indicating the existence
  // of the repo
  const maybeOpenRepo = (cb) => {
    // nothing to do
    if (repoOpen) {
      return cb(null, true)
    }

    self._repo.open((err, res) => {
      if (err) {
        // If the error is that no repo exists,
        // which happens when the version file is not found
        // we just want to signal that no repo exist, not
        // fail the whole process.

        // Use standardized errors as much as possible
        if (err.code === RepoErrors.ERR_REPO_NOT_INITIALIZED) {
          return cb(null, false)
        }

        // TODO: As error codes continue to be standardized, this logic can be phase out;
        // it is here to maintain compatability
        if (err.message.match(/not found/) || // indexeddb
          err.message.match(/ENOENT/) || // fs
          err.message.match(/No value/) // memory
        ) {
          return cb(null, false)
        }
        return cb(err)
      }
      cb(null, true)
    })
  }

  const tasks = [
    (cb) => maybeOpenRepo(cb),
    (repoOpened, cb) => {
      if (!doInit || repoOpened) return cb(null, repoOpened)
      // No repo, but should init one
      self.init(initOptions, (err) => cb(err, true))
    },
    (initialized, cb) => {
      if (initialized) {
        self.log('initialized')
        self.state.initialized()
      }
      cb(null, initialized)
    },
    (initialized, cb) => {
      // No problem, we can't preStart until we're initialized
      if (!initialized) return cb()
      self.preStart(cb)
    },
    (cb) => {
      // No problem, we don't have to start the node
      if (!doStart) return cb()
      self.start(cb)
    }
  ]

  // Do the actual boot sequence
  waterfall(tasks, (err) => {
    if (err) {
      return self.emit('error', err)
    }
    self.log('booted')
    self.emit('ready')
  })
}
