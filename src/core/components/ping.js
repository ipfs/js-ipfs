'use strict'

const promisify = require('promisify-es6')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Readable = require('readable-stream').Readable

function getPacket (msg) {
  // Default msg
  const basePacket = {Success: false, Time: 0, Text: ''}
  // ndjson
  return `${JSON.stringify(Object.assign({}, basePacket, msg))}\n`
}

module.exports = function ping (self) {
  return promisify((peerId, count, cb) => {
    if (!self.isOnline()) {
      return cb(new Error(OFFLINE_ERROR))
    }

    const source = new Readable({
      read: function () {}
    })

    let peer
    try {
      peer = self._libp2pNode.peerBook.get(peerId)
    } catch (err) {
      // Conforming with go implemmentation, not sure if makes sense to log this
      // since we perform no `findPeer`
      source.push(getPacket({Success: true, Text: `Looking up peer ${peerId}`}))
      peer = new PeerInfo(PeerId.createFromB58String(peerId))
    }

    self._libp2pNode.ping(peer, (err, p) => {
      let packetCount = 0 
      let totalTime = 0
      source.push(getPacket({Success: true, Text: `PING ${peerId}`}))
      p.on('ping', (time) => {
        source.push(getPacket({ Success: true, Time: time }))
        totalTime += time
        packetCount++
        if (packetCount >= count) {
          const average = totalTime/count
          p.stop()
          source.push(getPacket({ Success: false, Text: `Average latency: ${average}ms`}))
          source.push(null)
        }
      })
    })
    cb(null, source)
  })
}
