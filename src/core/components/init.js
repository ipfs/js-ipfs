'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')

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

    let config
    // Pre-set config values.
    try {
      config = require('../../init-files/default-config.json')
    } catch (err) {
      return callback(err)
    }

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
        if (typeof addDefaultAssets === 'function' && !opts.emptyRepo) {
          return addDefaultAssets(self, opts.log, cb)
        }

        cb(null, true)
      }
    ], callback)
  }
}
