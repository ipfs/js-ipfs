'use strict'

const EventEmitter = require('events')

function fail () {
  throw new Error('The daemon must be run with \'--enable-pubsub-experiment\'')
}

class NoFloodSub extends EventEmitter {
  constructor () {
    super()

    this.peers = new Map()
    this.subscriptions = new Set()
  }

  start (callback) { callback() }
  stop (callback) { callback() }
  publish () { fail() }
  subscribe () { fail() }
  unsubscribe () { fail() }
}

module.exports = NoFloodSub
