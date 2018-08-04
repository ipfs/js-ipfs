'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const promisify = require('promisify-es6')
const defaultConfig = require('../runtime/config-nodejs.js')
const Keychain = require('libp2p-keychain')

const addDefaultAssets = require('./init-assets')

module.exports = function init (self) {
  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    const done = (err, res) => {
      if (err) {
        self.emit('error', err)
        return callback(err)
      }

      self.preStart((err) => {
        if (err) {
          self.emit('error', err)
          return callback(err)
        }

        self.state.initialized()
        self.emit('init')
        callback(null, res)
      })
    }

    if (self.state.state() !== 'uninitialized') {
      return done(new Error('Not able to init from state: ' + self.state.state()))
    }

    self.state.init()
    self.log('init')

    // An initialized, open repo was passed, use this one!
    if (opts.repo) {
      self._repo = opts.repo
      return done(null, true)
    }

    opts.emptyRepo = opts.emptyRepo || false
    opts.bits = Number(opts.bits) || 2048
    opts.log = opts.log || function () {}
    const config = defaultConfig()
    let privateKey
    waterfall([
      // Verify repo does not yet exist.
      (cb) => self._repo.exists(cb),
      (exists, cb) => {
        self.log('repo exists?', exists)
        if (exists === true) {
          return cb(new Error('repo already exists'))
        }

        if (opts.pregenId) {
          // Use pregenerated Id
          self.log('using pregenerated id')
          cb(null, opts.pregenId)
        } else if (process.env.IPFS_PREGENERATED_PRIVATE_KEY) {
          // Use pregenerated Id from env
          self.log('using pregenerated id from env')
          peerId.createFromPrivKey(Buffer.from(process.env.IPFS_PREGENERATED_PRIVATE_KEY, 'base64'), cb)
        } else {
          // Generate peer identity keypair + transform to desired format + add to config.
          opts.log(`generating ${opts.bits}-bit RSA keypair...`, false)
          self.log('generating peer id: %s bits', opts.bits)
          peerId.create({ bits: opts.bits }, cb)
        }
      },
      (keys, cb) => {
        self.log('identity generated')
        config.Identity = {
          PeerID: keys.toB58String(),
          PrivKey: keys.privKey.bytes.toString('base64')
        }
        if (opts.pass) {
          privateKey = keys.privKey
          config.Keychain = Keychain.generateOptions()
        }
        opts.log('done')
        opts.log('peer identity: ' + config.Identity.PeerID)

        self._repo.init(config, cb)
      },
      (_, cb) => self._repo.open(cb),
      (cb) => {
        self.log('repo opened')
        if (opts.pass) {
          self.log('creating keychain')
          const keychainOptions = Object.assign({passPhrase: opts.pass}, config.Keychain)
          self._keychain = new Keychain(self._repo.keys, keychainOptions)
          self._keychain.importPeer('self', { privKey: privateKey }, cb)
        } else {
          cb(null, true)
        }
      },
      (_, cb) => {
        if (opts.emptyRepo) {
          return cb(null, true)
        }

        const tasks = [
          // add empty unixfs dir object (go-ipfs assumes this exists)
          (cb) => self.object.new('unixfs-dir', cb)
        ]

        if (typeof addDefaultAssets === 'function') {
          // addDefaultAssets is undefined on browsers.
          // See package.json browser config
          tasks.push((cb) => addDefaultAssets(self, opts.log, cb))
        }

        self.log('adding assets')
        parallel(tasks, (err) => {
          if (err) {
            cb(err)
          } else {
            cb(null, true)
          }
        })
      }
    ], done)
  })
}
