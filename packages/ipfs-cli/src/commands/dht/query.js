import parseDuration from 'parse-duration'

export default {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {
    peerId: {
      type: 'string'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.peerId
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, peerId, timeout }) {
    const seen = new Set()

    for await (const event of ipfs.dht.query(peerId, {
      timeout
    })) {
      if (event.name === 'PEER_RESPONSE') {
        event.closer.forEach(peerData => {
          if (seen.has(peerData.id)) {
            return
          }

          print(peerData.id)
          seen.add(peerData.id)
        })
      }
    }
  }
}
