import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {
    key: {
      string: true,
      coerce: coerceCID
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, timeout }) {
    const stats = await ipfs.object.stat(key, { timeout })

    Object.entries(stats).forEach(([key, value]) => {
      if (key === 'Hash') {
        return // only for js-ipfs-http-client output
      }

      print(`${key}: ${value}`)
    })
  }
}

export default command
