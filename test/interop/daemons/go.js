'use strict'

const ctl = require('ipfsd-ctl')
const waterfall = require('async/waterfall')

class GoDaemon {
  constructor () {
    this.node = null
    this.api = null
  }

  start (callback) {
    console.log('starting go')
    waterfall([
      (cb) => ctl.disposable(cb),
      (node, cb) => {
        this.node = node
        this.node.startDaemon(cb)
      },
      (api, cb) => {
        this.api = api
        cb()
      }
    ], callback)
  }

  stop (callback) {
    this.node.stopDaemon(callback)
  }
}

module.exports = GoDaemon
