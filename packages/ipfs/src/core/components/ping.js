'use strict'

const PeerId = require('peer-id')
const basePacket = { success: true, time: 0, text: '' }
const { withTimeoutOption } = require('../utils')

/**
 * @typedef {import("./init").LibP2P} LibP2P
 */

/**
 * @typedef {Object} Packet
 * @property {boolean} success
 * @property {number} time
 * @property {string} text
 *
 * @typedef {Object} PingOptions
 * @property {number} [count=10]
 *
 * @typedef {Object} PingConfig
 * @property {LibP2P} libp2p
 */

/**
 * @param {PingConfig} config
 * @returns {Ping}
 */
module.exports = ({ libp2p }) => {
  /**
   * @callback Ping
   * @param {PeerId} peerId
   * @param {PingOptions} [options]
   * @returns {AsyncIterable<Packet>}
   *
   * @type {Ping}
   */
  async function * ping (peerId, options) {
    options = options || {}
    options.count = options.count || 10

    if (!PeerId.isPeerId(peerId)) {
      peerId = PeerId.createFromCID(peerId)
    }

    let peerInfo
    if (libp2p.peerStore.has(peerId)) {
      peerInfo = libp2p.peerStore.get(peerId)
    } else {
      yield { ...basePacket, text: `Looking up peer ${peerId}` }
      peerInfo = await libp2p.peerRouting.findPeer(peerId)
    }

    yield { ...basePacket, text: `PING ${peerInfo.id.toB58String()}` }

    let packetCount = 0
    let totalTime = 0

    for (let i = 0; i < options.count; i++) {
      try {
        const time = await libp2p.ping(peerInfo)
        totalTime += time
        packetCount++
        yield { ...basePacket, time }
      } catch (err) {
        yield { ...basePacket, success: false, text: err.toString() }
      }
    }

    if (packetCount) {
      const average = totalTime / packetCount
      yield { ...basePacket, text: `Average latency: ${average}ms` }
    }
  }

  return withTimeoutOption(ping)
}
