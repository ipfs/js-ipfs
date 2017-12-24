'use strict'

const peerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const waterfall = require('async/waterfall')
const Keychain = require('libp2p-keychain')
const NoKeychain = require('./no-keychain')
/*
 * Load stuff from Repo into memory
 */
module.exports = function preStart (self) {
  return (callback) => {
    self.log('pre-start')

    const pass = self._options.pass
    let importSelf = false
    waterfall([
      (cb) => self._repo.config.get(cb),
      (config, cb) => {
        // Upgrade to keychain?
        if (!pass || config.Keychain) {
          return cb(null, config)
        }
        config.Keychain = Keychain.generateOptions()
        self.config.set('Keychain', config.Keychain, (err) => {
          if (err) return cb(err)
          const keychainOptions = Object.assign({passPhrase: pass}, config.Keychain)
          self._keychain = new Keychain(self._repo.keys, keychainOptions)
          importSelf = true
          self.log('Upgrade repo for a keychain')
          cb(null, config)
        })
      },
      (config, cb) => {
        if (self._keychain) {
          // most likely an init or upgrade has happened
        } else if (pass) {
          const keychainOptions = Object.assign({passPhrase: pass}, config.Keychain)
          self._keychain = new Keychain(self._repo.keys, keychainOptions)
          self.log('keychain constructed')
        } else {
          self._keychain = new NoKeychain()
          self.log('no keychain, use --pass')
        }
        cb(null, config)
      },
      (config, cb) => {
        const privKey = config.Identity.PrivKey

        peerId.createFromPrivKey(privKey, (err, id) => {
          if (!err && importSelf) {
            return self._keychain.importPeer('self', id, (err) => cb(err, config, id))
          }
          cb(err, config, id)
        })
      },
      (config, id, cb) => {
        self.log('peer created')
        self._peerInfo = new PeerInfo(id)

        if (config.Addresses && config.Addresses.Swarm) {
          config.Addresses.Swarm.forEach((addr) => {
            let ma = multiaddr(addr)

            if (ma.getPeerId()) {
              ma = ma.encapsulate('/ipfs/' + self._peerInfo.id.toB58String())
            }

            self._peerInfo.multiaddrs.add(ma)
          })
        }

        cb()
      }
    ], callback)
  }
}
