'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  coerceMultiaddr
} = require('../../utils')

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {
    address: {
      type: 'string',
      coerce: coerceMultiaddr
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiaddr').Multiaddr} argv.address
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, isDaemon, print }, address, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    await ipfs.swarm.disconnect(address, {
      timeout
    })

    print(`${address}`)
  }
}
