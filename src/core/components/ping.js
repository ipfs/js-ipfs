'use strict'

const promisify = require('promisify-es6')
const debug = require('debug')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const pull = require('pull-stream/pull')
const Pushable = require('pull-pushable')
const ndjson = require('pull-ndjson')
const waterfall = require('async/waterfall')

const log = debug('jsipfs:ping')
log.error = debug('jsipfs:ping:error')

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

    waterfall([
      getPeer.bind(null, self._libp2pNode, source, peerId),
      runPing.bind(null, self._libp2pNode, source, count)
    ], (err) => {
      log.error(err)
      source.push(getPacket({Text: err.toString()}))
      return source.end(err)
    })

    cb(null, response)
  })
}

function getPacket (msg) {
  // Default msg
  const basePacket = {Success: false, Time: 0, Text: ''}
  return Object.assign({}, basePacket, msg)
}

function getPeer (libp2pNode, statusStream, peerId, cb) {
  let peer
  try {
    peer = libp2pNode.peerBook.get(peerId)
    console.log(peer)
    return cb(null, peer)
  } catch (err) {
    log('Peer not found in peer book, trying peer routing')
    // Share lookup status just as in the go implemmentation
    statusStream.push(getPacket({Success: true, Text: `Looking up peer ${peerId}`}))
    // Try to use peerRouting
    libp2pNode.peerRouting.findPeer(peerId, cb)
  }
}

function runPing (libp2pNode, statusStream, count, peer, cb) {
  libp2pNode.ping(peer, (err, p) => {
    if (err) {
      return cb(err)
    }

    let packetCount = 0
    let totalTime = 0
    statusStream.push(getPacket({Success: true, Text: `PING ${peer.id.toB58String()}`}))

    p.on('ping', (time) => {
      statusStream.push(getPacket({ Success: true, Time: time }))
      totalTime += time
      packetCount++
      if (packetCount >= count) {
        const average = totalTime / count
        p.stop()
        statusStream.push(getPacket({ Success: true, Text: `Average latency: ${average}ms` }))
        statusStream.end()
      }
    })

    p.on('error', (err) => {
      log.error(err)
      p.stop()
      statusStream.push(getPacket({Text: err.toString()}))
      statusStream.end(err)
    })

    p.start()

    return cb()
  })
}
