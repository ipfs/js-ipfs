'use strict'

const promisify = require('promisify-es6')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
var Readable = require('stream').Readable

module.exports = function ping (self) {
  return promisify((peerId, cb) => {
    if (!self.isOnline()) {
      return cb(new Error(OFFLINE_ERROR))
    }

    var outputStream = new Readable()
    outputStream._read = function (size) {
    }

    let peer
    try {
      peer = self._libp2pNode.peerBook.get(peerId)
    } catch (err) {
      peer = new PeerInfo(PeerId.createFromB58String(peerId))
    }

    self._libp2pNode.ping(peer, (err, p) => {
      p.once('ping', (time) => {
        outputStream.push(JSON.stringify([{}, { Success: true, Time: time }, { Text: 'Average latency: ' + time + ' ms' }]))
        outputStream.push(null)
        p.stop()
        cb(err, outputStream)
      })
    })
  })
}
