'use strict'

const promisify = require('promisify-es6')
const debug = require('debug')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const pull = require('pull-stream/pull')
const Pushable = require('pull-pushable')
const ndjson = require('pull-ndjson')

const log = debug('jsipfs:ping')
log.error = debug('jsipfs:ping:error')

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

    const source = Pushable()

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
        log.error(err)
        source.push(getPacket({Text: err.toString()}))
        return source.end(err)
      }

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
          source.push(getPacket({ Success: true, Text: `Average latency: ${average}ms` }))
          source.end()
        }
      })

      p.on('error', (err) => {
        log.error(err)
        p.stop()
        source.push(getPacket({Text: err.toString()}))
        source.end(err)
      })

      p.start()
    })
    
    cb(null, response)
  })
}
