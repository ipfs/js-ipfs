import parseDuration from 'parse-duration'

export default {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {number} argv.timeout
   *
   * @returns {Promise<void>}
   */
  async handler ({ ctx: { ipfs, print }, timeout }) {
    const result = await ipfs.name.pubsub.state({
      timeout
    })
    print(result.enabled ? 'enabled' : 'disabled')
  }
}
