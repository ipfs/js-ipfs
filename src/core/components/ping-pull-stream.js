'use strict'

const debug = require('debug')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const PeerId = require('peer-id')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')

const log = debug('ipfs:pingPullStream')
log.error = debug('ipfs:pingPullStream:error')

module.exports = function pingPullStream (self) {
  return (peerId, opts) => {
    if (!self.isOnline()) {
      return pull.error(new Error(OFFLINE_ERROR))
    }

    opts = Object.assign({ count: 10 }, opts)

    const source = Pushable()

    getPeer(self.libp2p, source, peerId, (err, peer) => {
      if (err) {
        log.error(err)
        source.end(err)
        return
      }

      runPing(self.libp2p, source, opts.count, peer, (err) => {
        if (err) {
          log.error(err)
          source.push(getPacket({ success: false, text: err.toString() }))
          source.end()
        }
      })
    })

    return source
  }
}

function getPacket (msg) {
  // Default msg
  const basePacket = { success: true, time: 0, text: '' }
  return Object.assign(basePacket, msg)
}

function getPeer (libp2pNode, statusStream, peerIdStr, cb) {
  let peerId

  try {
    peerId = PeerId.createFromB58String(peerIdStr)
  } catch (err) {
    return cb(err)
  }

  let peerInfo

  try {
    peerInfo = libp2pNode.peerBook.get(peerId)
  } catch (err) {
    log('Peer not found in peer book, trying peer routing')

    // Share lookup status just as in the go implemmentation
    statusStream.push(getPacket({ text: `Looking up peer ${peerIdStr}` }))
    return libp2pNode.peerRouting.findPeer(peerId, cb)
  }

  cb(null, peerInfo)
}

function runPing (libp2pNode, statusStream, count, peer, cb) {
  libp2pNode.ping(peer, (err, p) => {
    if (err) { return cb(err) }

    let packetCount = 0
    let totalTime = 0
    statusStream.push(getPacket({ text: `PING ${peer.id.toB58String()}` }))

    p.on('ping', (time) => {
      statusStream.push(getPacket({ time }))
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
      cb(err)
    })

    p.start()
  })
}
