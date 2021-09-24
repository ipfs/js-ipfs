import parseDuration from 'parse-duration'

export default {
  command: 'show',

  describe: 'Outputs the content of the config file',

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
    const config = await ipfs.config.getAll({
      timeout
    })
    print(JSON.stringify(config, null, 4))
  }
}
