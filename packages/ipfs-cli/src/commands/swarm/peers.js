import { IPFS } from '@multiformats/mafmt'
import { Multiaddr } from '@multiformats/multiaddr'
import parseDuration from 'parse-duration'

export default {
  command: 'peers',

  describe: 'List peers with open connections',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {number} argv.timeout
   *
   * @returns {Promise<void>}
   */
  async handler ({ ctx: { print, ipfs, isDaemon }, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    const result = await ipfs.swarm.peers({
      timeout
    })

    result.forEach((item) => {
      let ma = new Multiaddr(`${item.addr}`)

      if (!IPFS.matches(ma)) {
        ma = ma.encapsulate(`/ipfs/${item.peer}`)
      }

      print(`${ma}`)
    })
  }
}
