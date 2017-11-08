'use strict'

const waterfall = require('async/waterfall')
const series = require('async/series')
const extend = require('deep-extend')

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
  const initOptions = Object.assign({ bits: 2048 }, customInitOptions)

  // Checks if a repo exists, and if so opens it
  // Will return callback with a bool indicating the existence
  // of the repo
  const maybeOpenRepo = (cb) => {
    // nothing to do
    if (repoOpen) {
      return cb(null, true)
    }

    series([
      (cb) => self._repo.open(cb),
      (cb) => self.preStart(cb),
      (cb) => {
        self.state.initialized()
        cb(null, true)
      }
    ], (err, res) => {
      if (err) {
        // If the error is that no repo exists,
        // which happens when the version file is not found
        // we just want to signal that no repo exist, not
        // fail the whole process.
        // TODO: improve datastore and ipfs-repo implemenations so this error is a bit more unified
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

  const done = (err) => {
    if (err) {
      return self.emit('error', err)
    }
    self.emit('ready')
    self.log('boot:done', err)
  }

  const tasks = []

  // check if there as a repo and if so open it
  maybeOpenRepo((err, hasRepo) => {
    if (err) {
      return done(err)
    }

    // No repo, but need should init one
    if (doInit && !hasRepo) {
      tasks.push((cb) => self.init(initOptions, cb))
      // we know we will have a repo for all follwing tasks
      // if the above succeeds
      hasRepo = true
    }

    // Need to set config
    if (setConfig) {
      if (!hasRepo) {
        console.log('WARNING, trying to set config on uninitialized repo, maybe forgot to set "init: true"')
      } else {
        tasks.push((cb) => {
          waterfall([
            (cb) => self.config.get(cb),
            (config, cb) => {
              extend(config, options.config)

              self.config.replace(config, cb)
            }
          ], cb)
        })
      }
    }

    // Need to start up the node
    if (doStart) {
      if (!hasRepo) {
        console.log('WARNING, trying to start ipfs node on uninitialized repo, maybe forgot to set "init: true"')
        return done(new Error('Uninitalized repo'))
      } else {
        tasks.push((cb) => self.start(cb))
      }
    }

    // Do the actual boot sequence
    series(tasks, done)
  })
}
