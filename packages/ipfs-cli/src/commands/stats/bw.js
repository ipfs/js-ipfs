import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@libp2p/interface-peer-id').PeerId} Argv.peer
 * @property {string} Argv.proto
 * @property {boolean} Argv.poll
 * @property {number} Argv.interval
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'bw',

  describe: 'Get bandwidth information',

  builder: {
    peer: {
      string: true,
      coerce: coercePeerId
    },
    proto: {
      string: true,
      default: ''
    },
    poll: {
      boolean: true,
      default: false
    },
    interval: {
      string: true,
      default: '1s',
      coerce: parseDuration
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, peer, proto, poll, interval, timeout }) {
    for await (const chunk of ipfs.stats.bw({ peer, proto, poll, interval, timeout })) {
      print(`bandwidth status
  total in: ${chunk.totalIn}B
  total out: ${chunk.totalOut}B
  rate in: ${chunk.rateIn}B/s
  rate out: ${chunk.rateOut}B/s`)
    }
  }
}

export default command
