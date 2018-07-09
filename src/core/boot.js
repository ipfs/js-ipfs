'use strict'

const waterfall = require('async/waterfall')
const auto = require('async/auto')
const extend = require('deep-extend')
const RepoErrors = require('ipfs-repo').errors

// Boot an IPFS node depending on the options set
module.exports = (self) => {
  self.log('booting')
  const options = self._options
  const doInit = options.init
  const doStart = options.start
  const config = options.config
  const setConfig = config && typeof config === 'object'
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
      cb(null, res)
    })
  }

  const tasks = {
    repoExists: (cb) => maybeOpenRepo(cb),
    repoCreated: ['repoExists', (res, cb) => {
      if (!doInit || res.repoExists) return cb(null, false)
      // No repo, but need should init one
      self.init(initOptions, (err) => {
        if (err) return cb(err)
        cb(null, true)
      })
    }],
    loadPinset: ['repoExists', (res, cb) => {
      if (!res.repoExists) return cb()
      self.pin._load(cb)
    }],
    setConfig: ['repoExists', 'repoCreated', (res, cb) => {
      if (!setConfig) return cb()

      if (!res.repoExists && !res.repoCreated) {
        console.log('WARNING, trying to set config on uninitialized repo, maybe forgot to set "init: true"')
        return cb()
      }

      waterfall([
        (cb) => self.config.get(cb),
        (config, cb) => {
          extend(config, options.config)
          self.config.replace(config, cb)
        }
      ], cb)
    }],
    initialize: ['repoExists', 'loadPinset', 'repoCreated', 'setConfig', (res, cb) => {
      self.log('initialized')
      self.state.initialized()
      cb(null, true)
    }],
    start: ['repoExists', 'repoCreated', 'initialize', (res, cb) => {
      if (!doStart) return cb()

      // If the repo didn't already exists and wasn't just created then can't start
      if (!res.repoExists && !res.repoCreated) {
        console.log('WARNING, trying to start ipfs node on uninitialized repo, maybe forgot to set "init: true"')
        return cb(new Error('Uninitalized repo'))
      }

      self.start(cb)
    }]
  }

  // Do the actual boot sequence
  auto(tasks, (err) => {
    if (err) {
      return self.emit('error', err)
    }
    self.log('booted')
    self.emit('ready')
  })
}
