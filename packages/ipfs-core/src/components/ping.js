import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @typedef {Pong|PingFailure|StatusUpdate} Packet
 * Note that not all ping response objects are "pongs".
 * A "pong" message can be identified by a truthy success property and an empty
 * text property. Other ping responses are failures or status updates.
 *
 * @typedef {object} Pong
 * @property {true} success
 * @property {number} time
 * @property {''} text
 *
 * @typedef {object} PingFailure
 * @property {false} success
 * @property {number} time
 * @property {string} text
 *
 * @typedef {object} StatusUpdate
 * @property {true} success
 * @property {0} time
 * @property {string} text
 *
 * @typedef {PingSettings & AbortOptions} PingOptions
 *
 * @typedef {object} PingSettings
 * @property {number} [count=10] - The number of ping messages to send
 *
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/** @type {{success:true, time:0, text: ''}} */
const basePacket = { success: true, time: 0, text: '' }

/**
 * @param {object} config
 * @param {import('../types').NetworkService} config.network
 */
export function createPing ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["ping"]}
   */
  async function * ping (peerId, options = {}) {
    const { libp2p } = await network.use()
    options.count = options.count || 10

    const storedPeer = await libp2p.peerStore.get(peerId)
    let id = storedPeer && storedPeer.id

    if (!id) {
      yield { ...basePacket, text: `Looking up peer ${peerId}` }
      const remotePeer = await libp2p.peerRouting.findPeer(peerId)

      id = remotePeer && remotePeer.id
    }

    if (!id) {
      throw new Error('Peer was not found')
    }

    yield { ...basePacket, text: `PING ${id.toString()}` }

    let packetCount = 0
    let totalTime = 0

    for (let i = 0; i < options.count; i++) {
      try {
        const time = await libp2p.ping(id)
        totalTime += time
        packetCount++
        yield { ...basePacket, time }
      } catch (/** @type {any} */ err) {
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
