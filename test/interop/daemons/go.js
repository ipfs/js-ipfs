'use strict'

const ctl = require('ipfsd-ctl')
const waterfall = require('async/waterfall')

class GoDaemon {
  constructor (opts) {
    opts = opts || {
      disposable: true,
      init: true
    }

    this.init = opts.init
    this.path = opts.path
    this.disposable = opts.disposable
    this.node = null
    this.api = null
  }

  start (callback) {
    waterfall([
      (cb) => {
        if (this.disposable) {
          ctl.disposable({init: this.init}, cb)
        } else if (this.init) {
          ctl.local(this.path, (err, node) => {
            if (err) {
              return cb(err)
            }
            node.init((err) => cb(err, node))
          })
        } else {
          ctl.local(this.path, cb)
        }
      },
      (node, cb) => {
        this.node = node
        this.node.setConfig('Bootstrap', '[]', cb)
      },
      (res, cb) => this.node.startDaemon(cb),
      (api, cb) => {
        this.api = api

        if (process.env.DEBUG) {
          this.api.log.tail((err, stream) => {
            if (err) {
              return console.error(err)
            }
            stream.on('data', (chunk) => {
              console.log('go-log: %s.%s %s (%s)', chunk.system, chunk.subsystem || '', chunk.event, chunk.error)
            })
          })
          this.node._run(
            ['log', 'level', 'all', 'debug'],
            {env: this.node.env},
            cb
          )
        } else {
          cb()
        }
      }
    ], (err) => callback(err))
  }

  stop (callback) {
    this.node.stopDaemon(callback)
  }
}

module.exports = GoDaemon
