import parseDuration from 'parse-duration'

export default {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {string} argv.name
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, name, timeout }) {
    const result = await ipfs.name.pubsub.cancel(name, {
      timeout
    })
    print(result.canceled ? 'canceled' : 'no subscription')
  }
}
