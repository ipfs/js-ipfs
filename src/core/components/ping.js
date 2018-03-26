'use strict'

const promisify = require('promisify-es6')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const pull = require('pull-stream/pull')
const take = require('pull-stream/throughs/take')
const Pushable = require('pull-pushable')
const ndjson = require('pull-ndjson')

function getPacket (msg) {
  // Default msg
  const basePacket = {Success: false, Time: 0, Text: ''}
  return Object.assign({}, basePacket, msg)
}

module.exports = function ping (self) {
  return promisify((peerId, count, cb) => {
    if (!self.isOnline()) {
      return cb(new Error(OFFLINE_ERROR))
    }

    const source = Pushable(function (err) {
      console.log('stream closed!', err)
    })

    const response = pull(
      source,
      ndjson.serialize()
    )

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
      if (err) {
        console.log('ERROR', err)
        return source.abort(err)
      }
      let packetCount = 0 
      let totalTime = 0
      source.push(getPacket({Success: true, Text: `PING ${peerId}`}))
      p.on('ping', (time) => {
        console.log('ON PING')
        source.push(getPacket({ Success: true, Time: time }))
        totalTime += time
        packetCount++
        console.log(packetCount, count)
        if (packetCount >= count) {
          const average = totalTime/count
          p.stop()
          source.push(getPacket({ Success: false, Text: `Average latency: ${average}ms`}))
          source.end()
        }
      })
      console.log('Setup handler')
      p.on('error', (err) => {
        console.log('ERROR BATATA', err)
        source.abort(err)
      })
    })
    
    cb(null, response)
  })
}
