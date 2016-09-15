'use strict'

const peerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const waterfall = require('run-waterfall')

const utils = require('../utils')

module.exports = function load (self) {
  return (callback) => {
    waterfall([
      (cb) => utils.ifRepoExists(self._repo, cb),
      (cb) => self._repo.config.get(cb),
      (config, cb) => {
        const id = peerId.createFromPrivKey(config.Identity.PrivKey)

        self._peerInfo = new PeerInfo(id)
        config.Addresses.Swarm.forEach((addr) => {
          self._peerInfo.multiaddr.add(multiaddr(addr))
        })
        cb()
      }
    ], callback)
  }
}
