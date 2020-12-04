'use strict'

const PeerId = require('peer-id')
/** @type {{success:true, time:0, text: ''}} */
const basePacket = { success: true, time: 0, text: '' }
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Send echo request packets to IPFS hosts.
   *
   * @param {PeerId} peerId - The remote peer to send packets to
   * @param {PingOptions} [options]
   * @returns {AsyncIterable<Packet>}
   * @example
   * ```js
   * for await (const res of ipfs.ping('Qmhash')) {
   *   if (res.time) {
   *     console.log(`Pong received: time=${res.time} ms`)
   *   } else {
   *     console.log(res.text)
   *   }
   * }
   * ```
   */
  async function * ping (peerId, options = {}) {
    const { libp2p } = await network.use()
    options.count = options.count || 10

    if (!PeerId.isPeerId(peerId)) {
      peerId = PeerId.createFromCID(peerId)
    }

    let peer = libp2p.peerStore.get(peerId)

    if (!peer) {
      yield { ...basePacket, text: `Looking up peer ${peerId}` }
      peer = await libp2p.peerRouting.findPeer(peerId)
    }

    yield { ...basePacket, text: `PING ${peer.id.toB58String()}` }

    let packetCount = 0
    let totalTime = 0

    for (let i = 0; i < options.count; i++) {
      try {
        const time = await libp2p.ping(peer.id)
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

/**
 * @typedef {Pong|PingFailure|StatusUpdate} Packet
 * Note that not all ping response objects are "pongs".
 * A "pong" message can be identified by a truthy success property and an empty
 * text property. Other ping responses are failures or status updates.
 *
 * @typedef {Object} Pong
 * @property {true} success
 * @property {number} time
 * @property {''} text
 *
 * @typedef {Object} PingFailure
 * @property {false} success
 * @property {number} time
 * @property {string} text
 *
 * @typedef {Object} StatusUpdate
 * @property {true} success
 * @property {0} time
 * @property {string} text
 *
 * @typedef {PingSettings & AbortOptions} PingOptions
 *
 * @typedef {Object} PingSettings
 * @property {number} [count=10] - The number of ping messages to send
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
