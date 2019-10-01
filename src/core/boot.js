'use strict'

const RepoErrors = require('ipfs-repo').errors

// Boot an IPFS node depending on the options set
module.exports = async (self) => {
  self.log('booting')
  const options = self._options
  const doInit = options.init
  const doStart = options.start

  // Checks if a repo exists, and if so opens it
  // Will return callback with a bool indicating the existence
  // of the repo
  async function repoOpened () {
    // nothing to do
    if (!self._repo.closed) {
      return true
    }

    try {
      await self._repo.open()
    } catch (err) {
      if (isRepoUninitializedError(err)) {
        return false
      }

      if (err) {
        throw err
      }
    }

    return true
  }

  // Do the actual boot sequence
  try {
    // Init with existing initialized, opened, repo
    if (await repoOpened()) {
      try {
        await self.init({ repo: self._repo })
      } catch (err) {
        throw Object.assign(err, { emitted: true })
      }
    } else if (doInit) {
      const defaultInitOptions = {
        bits: 2048,
        pass: self._options.pass
      }

      const initOptions = Object.assign(defaultInitOptions, typeof options.init === 'object' ? options.init : {})

      await self.init(initOptions)
    }

    if (doStart) {
      await self.start()
    }

    self.log('booted')
    self.emit('ready')
  } catch (err) {
    if (!err.emitted) {
      self.emit('error', err)
    }
  }
}

function isRepoUninitializedError (err) {
  // If the error is that no repo exists,
  // which happens when the version file is not found
  // we just want to signal that no repo exist, not
  // fail the whole process.

  // Use standardized errors as much as possible
  if (err.code === RepoErrors.ERR_REPO_NOT_INITIALIZED) {
    return true
  }

  // TODO: As error codes continue to be standardized, this logic can be phase out;
  // it is here to maintain compatibility
  if (err.message.match(/not found/) || // indexeddb
    err.message.match(/ENOENT/) || // fs
    err.message.match(/No value/) // memory
  ) {
    return true
  }

  return false
}
