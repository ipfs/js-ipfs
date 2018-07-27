'use strict'

const waterfall = require('async/waterfall')
const RepoErrors = require('ipfs-repo').errors

// Boot an IPFS node depending on the options set
module.exports = (self) => {
  self.log('booting')
  const options = self._options
  const doInit = options.init
  const doStart = options.start

  // Do the actual boot sequence
  waterfall([
    // Checks if a repo exists, and if so opens it
    // Will return callback with a bool indicating the existence
    // of the repo
    (cb) => {
      // nothing to do
      if (!self._repo.closed) {
        return cb(null, true)
      }

      self._repo.open((err, res) => {
        if (isRepoUninitializedError(err)) return cb(null, false)
        if (err) return cb(err)
        cb(null, true)
      })
    },
    (repoOpened, cb) => {
      // Init with existing initialized, opened, repo
      if (repoOpened) {
        return self.init({ repo: self._repo }, (err) => {
          if (err) return cb(Object.assign(err, { emitted: true }))
          cb()
        })
      }

      if (doInit) {
        const initOptions = Object.assign(
          { bits: 2048, pass: self._options.pass },
          typeof options.init === 'object' ? options.init : {}
        )
        return self.init(initOptions, (err) => {
          if (err) return cb(Object.assign(err, { emitted: true }))
          cb()
        })
      }

      cb()
    },
    (cb) => {
      // No problem, we don't have to start the node
      if (!doStart) {
        return cb()
      }

      self.start((err) => {
        if (err) return cb(Object.assign(err, { emitted: true }))
        cb()
      })
    }
  ], (err) => {
    if (err) {
      if (!err.emitted) {
        self.emit('error', err)
      }
      return
    }
    self.log('booted')
    self.emit('ready')
  })
}

function isRepoUninitializedError (err) {
  if (!err) {
    return false
  }

  // If the error is that no repo exists,
  // which happens when the version file is not found
  // we just want to signal that no repo exist, not
  // fail the whole process.

  // Use standardized errors as much as possible
  if (err.code === RepoErrors.ERR_REPO_NOT_INITIALIZED) {
    return true
  }

  // TODO: As error codes continue to be standardized, this logic can be phase out;
  // it is here to maintain compatability
  if (err.message.match(/not found/) || // indexeddb
    err.message.match(/ENOENT/) || // fs
    err.message.match(/No value/) // memory
  ) {
    return true
  }

  return false
}
