import { commands } from './addrs/index.js'
import parseDuration from 'parse-duration'

export default {
  command: 'addrs',

  describe: '',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
      .option('timeout', {
        type: 'string',
        coerce: parseDuration
      })
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {number} argv.timeout
   */
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
