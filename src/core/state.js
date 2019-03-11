'use strict'

const debug = require('debug')
const log = debug('ipfs:state')
log.error = debug('ipfs:state:error')

const fsm = require('fsm-event')

module.exports = (self) => {
  const s = fsm('uninitialized', {
    uninitialized: {
      init: 'initializing',
      initialized: 'stopped'
    },
    initializing: {
      initialized: 'stopped'
    },
    stopped: {
      start: 'starting'
    },
    starting: {
      started: 'running'
    },
    running: {
      stop: 'stopping'
    },
    stopping: {
      stopped: 'stopped'
    }
  })

  // log events
  s.on('error', (err) => log.error(err))
  s.on('done', () => log('-> ' + s._state))

  // -- Actions

  s.init = () => {
    s('init')
  }

  s.initialized = () => {
    s('initialized')
  }

  s.stop = () => {
    s('stop')
  }

  s.stopped = () => {
    s('stopped')
  }

  s.start = () => {
    s('start')
  }

  s.started = () => {
    s('started')
  }

  s.state = () => s._state

  return s
}
