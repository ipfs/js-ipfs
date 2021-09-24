import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

export default {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.key
   * @param {number} argv.timeout
   */
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
