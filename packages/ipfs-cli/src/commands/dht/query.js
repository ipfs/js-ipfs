import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

export default {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {
    peerId: {
      type: 'string',
      coerce: coercePeerId
    },
    count: {
      type: 'number',
      default: 20
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('@libp2p/interfaces/peer-id').PeerId} argv.peerId
   * @param {number} argv.timeout
   * @param {number} argv.count
   *
   * @returns {Promise<void>}
   */
  async handler ({ ctx: { ipfs, print }, peerId, timeout, count }) {
    const seen = new Set()

    for await (const event of ipfs.dht.query(peerId, {
      timeout
    })) {
      if (event.name === 'PEER_RESPONSE') {
        for (const peerData of event.closer) {
          const peerId = peerData.id.toString()

          if (seen.has(peerId)) {
            continue
          }

          print(peerId)
          seen.add(peerId)

          if (seen.size === count) {
            return
          }
        }
      }

      if (event.name === 'FINAL_PEER') {
        return
      }
    }
  }
}
