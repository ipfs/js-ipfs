'use strict'

const debug = require('debug')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const PeerId = require('peer-id')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')
const waterfall = require('async/waterfall')

const log = debug('jsipfs:pingPullStream')
log.error = debug('jsipfs:pingPullStream:error')

module.exports = function pingPullStream (self) {
  return (peerId, opts) => {
    if (!self.isOnline()) {
      return pull.error(new Error(OFFLINE_ERROR))
    }

    opts = Object.assign({ count: 10 }, opts)

    const source = Pushable()

    waterfall([
      (cb) => getPeer(self._libp2pNode, source, peerId, cb),
      (peer, cb) => runPing(self._libp2pNode, source, opts.count, peer, cb)
    ], (err) => {
      if (err) {
        log.error(err)
        source.push(getPacket({ success: false, text: err.toString() }))
        source.end(err)
      }
    })

    return source
  }
}

function getPacket (msg) {
  // Default msg
  const basePacket = { success: true, time: 0, text: '' }
  return Object.assign(basePacket, msg)
}

function getPeer (libp2pNode, statusStream, peerId, cb) {
  let peer

  try {
    peer = libp2pNode.peerBook.get(peerId)
  } catch (err) {
    log('Peer not found in peer book, trying peer routing')
    // Share lookup status just as in the go implemmentation
    statusStream.push(getPacket({ text: `Looking up peer ${peerId}` }))

    // Try to use peerRouting
    try {
      peerId = PeerId.createFromB58String(peerId)
    } catch (err) {
      return cb(Object.assign(err, {
        message: `failed to parse peer address '${peerId}': input isn't valid multihash`
      }))
    }

    return libp2pNode.peerRouting.findPeer(peerId, cb)
  }

  cb(null, peer)
}

function runPing (libp2pNode, statusStream, count, peer, cb) {
  libp2pNode.ping(peer, (err, p) => {
    if (err) {
      return cb(err)
    }

    log('Got peer', peer)

    let packetCount = 0
    let totalTime = 0
    statusStream.push(getPacket({ text: `PING ${peer.id.toB58String()}` }))

    p.on('ping', (time) => {
      statusStream.push(getPacket({ time: time }))
      totalTime += time
      packetCount++
      if (packetCount >= count) {
        const average = totalTime / count
        p.stop()
        statusStream.push(getPacket({ text: `Average latency: ${average}ms` }))
        statusStream.end()
      }
    })

    p.on('error', (err) => {
      log.error(err)
      p.stop()
      statusStream.push(getPacket({ success: false, text: err.toString() }))
      statusStream.end(err)
    })

    p.start()

    return cb()
  })
}
