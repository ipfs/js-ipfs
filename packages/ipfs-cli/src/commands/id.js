import parseDuration from 'parse-duration'

export default {
  command: 'id [peerId]',

  describe: 'Shows IPFS Node ID info',

  builder: {
    peerid: {
      type: 'string',
      describe: 'Peer.ID of node to look up'
    },
    format: {
      alias: 'f',
      type: 'string',
      describe: 'Print Node ID info in the given format. Allowed tokens: <id> <aver> <pver> <pubkey> <addrs> <protocols>'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {string} argv.format
   * @param {number} argv.timeout
   * @param {string} [argv.peerId]
   */
  async handler ({ ctx: { ipfs, print }, format, timeout, peerId }) {
    const id = await ipfs.id({
      timeout,
      peerId
    })

    if (format) {
      print(format
        .replace('<id>', id.id)
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
