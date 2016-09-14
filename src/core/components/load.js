'use strict'

const peerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')

const utils = require('../utils')

module.exports = function load (self) {
  return (callback) => {
    utils.ifRepoExists(self._repo, (err) => {
      if (err) {
        return callback(err)
      }

      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        const pid = peerId.createFromPrivKey(config.Identity.PrivKey)
        self._peerInfo = new PeerInfo(pid)
        config.Addresses.Swarm.forEach((addr) => {
          self._peerInfo.multiaddr.add(multiaddr(addr))
        })
        callback()
      })
    })
  }
}
