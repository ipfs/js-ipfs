'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const isNode = require('detect-node')

const addDefaultAssets = require('./init-assets')

// Current repo version
const VERSION = '3'

module.exports = function init (self) {
  return (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts.emptyRepo = opts.emptyRepo || false
    opts.bits = Number(opts.bits) || 2048
    opts.log = opts.log || function () {}

    const config = isNode
      ? require('../../init-files/default-config-node.json')
      : require('../../init-files/default-config-browser.json')

    waterfall([
      // Verify repo does not yet exist.
      (cb) => self._repo.exists(cb),
      (exists, cb) => {
        if (exists === true) {
          return cb(new Error('repo already exists'))
        }

        // Generate peer identity keypair + transform to desired format + add to config.
        opts.log(`generating ${opts.bits}-bit RSA keypair...`, false)
        peerId.create({bits: opts.bits}, cb)
      },
      (keys, cb) => {
        config.Identity = {
          PeerID: keys.toB58String(),
          PrivKey: keys.privKey.bytes.toString('base64')
        }
        opts.log('done')
        opts.log('peer identity: ' + config.Identity.PeerID)

        self._repo.version.set(VERSION, cb)
      },
      (cb) => self._repo.config.set(config, cb),
      (cb) => {
        if (opts.emptyRepo) {
          return cb(null, true)
        }

        const tasks = [
          // add empty unixfs dir object (go-ipfs assumes this exists)
          (cb) => self.object.new('unixfs-dir', cb)
        ]

        if (typeof addDefaultAssets === 'function') {
          tasks.push((cb) => addDefaultAssets(self, opts.log, cb))
        }

        parallel(tasks, (err) => {
          if (err) {
            return cb(err)
          }

          cb(null, true)
        })
      }
    ], callback)
  }
}
