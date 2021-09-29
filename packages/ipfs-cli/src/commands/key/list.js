import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

export default {
  command: 'list',

  describe: 'List all local keys',

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
   */
  async handler ({ ctx: { ipfs, print }, timeout }) {
    const keys = await ipfs.key.list({
      timeout
    })
    keys.forEach((ki) => print(`${ki.id} ${stripControlCharacters(ki.name)}`))
  }
}
