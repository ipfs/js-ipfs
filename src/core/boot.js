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

  const maybeOpenRepo = (cb) => {
    waterfall([
      (cb) => self._repo.exists(cb),
      (exists, cb) => {
        self.log('boot:maybeOpen', exists, repoOpen)
        if (exists && !repoOpen) {
          return series([
            (cb) => self._repo.open(cb),
            (cb) => self.preStart(cb),
            (cb) => {
              self.state.initialized()
              cb()
            }
          ], cb)
        }
        cb()
      }
    ], cb)
  }

  const done = (err) => {
    if (err) {
      return self.emit('error', err)
    }
    self.emit('ready')
    self.log('boot:done', err)
  }

  const tasks = []

  self._repo.exists((err, repoExists) => {
    if (err) {
      return done(err)
    }
    if (doInit && !repoExists) {
      tasks.push((cb) => self.init(initOptions, cb))
    }
    if (repoExists) {
      tasks.push(maybeOpenRepo)
    }
    next(null, true)
  })

  function next (err, hasRepo) {
    self.log('boot:next')
    if (err) {
      return done(err)
    }

    if (setConfig) {
      self.log('boot:setConfig')
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

    if (doStart) {
      self.log('boot:doStart')
      if (!hasRepo) {
        console.log('WARNING, trying to start ipfs node on uninitialized repo, maybe forgot to set "init: true"')
        return done(new Error('Uninitalized repo'))
      } else {
        tasks.push((cb) => self.start(cb))
      }
    }

    series(tasks, done)
  }
}
