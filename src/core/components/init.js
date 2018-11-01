'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const promisify = require('promisify-es6')
const defaultsDeep = require('@nodeutils/defaults-deep')
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

    const config = defaultsDeep(self._options.config, defaultConfig())
    let privateKey

    waterfall([
      // Verify repo does not yet exist.
      (cb) => self._repo.exists(cb),
      (exists, cb) => {
        self.log('repo exists?', exists)
        if (exists === true) {
          return cb(new Error('repo already exists'))
        }

        if (opts.privateKey) {
          self.log('using user-supplied private-key')
          if (typeof opts.privateKey === 'object') {
            cb(null, opts.privateKey)
          } else {
            peerId.createFromPrivKey(Buffer.from(opts.privateKey, 'base64'), cb)
          }
        } else {
          // Generate peer identity keypair + transform to desired format + add to config.
          opts.log(`generating ${opts.bits}-bit RSA keypair...`, false)
          self.log('generating peer id: %s bits', opts.bits)
          peerId.create({ bits: opts.bits }, cb)
        }
      },
      (peerId, cb) => {
        self.log('identity generated')
        config.Identity = {
          PeerID: peerId.toB58String(),
          PrivKey: peerId.privKey.bytes.toString('base64')
        }
        privateKey = peerId.privKey
        if (opts.pass) {
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
          const keychainOptions = Object.assign({ passPhrase: opts.pass }, config.Keychain)
          self._keychain = new Keychain(self._repo.keys, keychainOptions)
          self._keychain.importPeer('self', { privKey: privateKey }, cb)
        } else {
          cb(null, true)
        }
      },
      // add empty unixfs dir object (go-ipfs assumes this exists)
      (_, cb) => {
        if (opts.emptyRepo) {
          return cb(null, true)
        }

        const tasks = [
          (cb) => {
            waterfall([
              (cb) => self.object.new('unixfs-dir', cb),
              (emptyDirNode, cb) => self._ipns.initializeKeyspace(privateKey, emptyDirNode.toJSON().multihash, cb)
            ], cb)
          }
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
