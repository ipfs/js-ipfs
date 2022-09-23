import parseDuration from 'parse-duration'
import { coercePeerId } from '../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.format
 * @property {number} Argv.timeout
 * @property {import('@libp2p/interface-peer-id').PeerId} [Argv.peerId]
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'id [peerId]',

  describe: 'Shows IPFS Node ID info',

  builder: {
    peerid: {
      string: true,
      describe: 'Peer.ID of node to look up',
      coerce: coercePeerId
    },
    format: {
      alias: 'f',
      string: true,
      describe: 'Print Node ID info in the given format. Allowed tokens: <id> <aver> <pver> <pubkey> <addrs> <protocols>'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, format, timeout, peerId }) {
    const id = await ipfs.id({
      timeout,
      peerId
    })

    if (format) {
      print(format
        .replace('<id>', id.id.toString())
        .replace('<aver>', id.agentVersion)
        .replace('<pver>', id.protocolVersion)
        .replace('<pubkey>', id.publicKey)
        .replace('<addrs>', (id.addresses || []).map(addr => addr.toString()).join('\n'))
        .replace('<protocols>', (id.protocols || []).map(protocol => protocol.toString()).join('\n'))
      )

      return
    }

    print(JSON.stringify(id, null, 2))
  }
}

export default command
