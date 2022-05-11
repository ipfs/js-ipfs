import { commands } from './addrs/index.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    commands.forEach(command => {
      yargs.command(command)
    })

    yargs
      .option('timeout', {
        string: true,
        coerce: parseDuration
      })

    return yargs
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const res = await ipfs.swarm.addrs({
      timeout
    })

    const output = res.map((peer) => {
      const count = peer.addrs.length
      const peerAddrs = [`${peer.id} (${count})`]

      peer.addrs.forEach((addr) => {
        let res
        try {
          res = addr.decapsulate('ipfs').toString()
        } catch (/** @type {any} */ _) {
          // peer addresses dont need to have /ipfs/ as we know their peerId
          // and can encapsulate on dial.
          res = addr.toString()
        }
        peerAddrs.push(`\t${res}`)
      })

      return peerAddrs.join('\n')
    })

    // Return the output for printing
    print(output.join('\n'))
  }
}

export default command
