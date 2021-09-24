import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

export default {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.name
   * @param {string} argv.newName
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, name, newName, timeout }) {
    const res = await ipfs.key.rename(name, newName, {
      timeout
    })
    print(`renamed to ${res.id} ${stripControlCharacters(res.now)}`)
  }
}
