import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@libp2p/interface-peer-id').PeerId} Argv.peerId
 * @property {number} Argv.timeout
 * @property {number} Argv.count
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT',

  builder: {
    peerId: {
      string: true,
      coerce: coercePeerId
    },
    count: {
      number: true,
      default: 20
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
