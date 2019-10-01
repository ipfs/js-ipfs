'use strict'

const peerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const Keychain = require('libp2p-keychain')
const mergeOptions = require('merge-options')
const NoKeychain = require('./no-keychain')
const callbackify = require('callbackify')
const promisify = require('promisify-es6')

/*
 * Load stuff from Repo into memory
 */
module.exports = function preStart (self) {
  return callbackify(async () => {
    self.log('pre-start')

    const pass = self._options.pass
    let config = await self._repo.config.get()

    if (self._options.config) {
      config = mergeOptions(config, self._options.config)
      await self.config.replace(config)
    }

    // Create keychain configuration, if needed.
    if (!config.Keychain) {
      config.Keychain = Keychain.generateOptions()
      await self.config.set('Keychain', config.Keychain)
      self.log('using default keychain options')
    }

    // Construct the keychain
    if (self._keychain) {
      // most likely an init or upgrade has happened
    } else if (pass) {
      const keychainOptions = Object.assign({ passPhrase: pass }, config.Keychain)
      self._keychain = new Keychain(self._repo.keys, keychainOptions)
      self.log('keychain constructed')
    } else {
      self._keychain = new NoKeychain()
      self.log('no keychain, use --pass')
    }

    const privKey = config.Identity.PrivKey
    const id = await promisify(peerId.createFromPrivKey)(privKey)

    // Import the private key as 'self', if needed.
    if (pass) {
      try {
        await self._keychain.findKeyByName('self')
      } catch (err) {
        self.log('Creating "self" key')
        await self._keychain.importPeer('self', id)
      }
    }

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

    await self.pin.pinManager.load()
  })
}
