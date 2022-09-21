import { IPFS } from '@multiformats/mafmt'
import { multiaddr } from '@multiformats/multiaddr'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'peers',

  describe: 'List peers with open connections',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs, isDaemon }, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    const result = await ipfs.swarm.peers({
      timeout
    })

    result.forEach((item) => {
      let ma = multiaddr(`${item.addr}`)

      if (!IPFS.matches(ma)) {
        ma = ma.encapsulate(`/ipfs/${item.peer}`)
      }

      print(`${ma}`)
    })
  }
}

export default command
