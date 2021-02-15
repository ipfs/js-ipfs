'use strict'

const { default: parseDuration } = require('parse-duration')
const { coercePeerId } = require('../../utils')

module.exports = {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {
    peerId: {
      type: 'string',
      coerce: coercePeerId
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('peer-id')} argv.peerId
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, peerId, timeout }) {
    for await (const result of ipfs.dht.query(peerId, {
      timeout
    })) {
      print(result.id.toString())
    }
  }
}
