import parseDuration from 'parse-duration'

export default {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

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
    const list = await ipfs.bootstrap.list({
      timeout
    })
    list.Peers.forEach((node) => print(node.toString()))
  }
}
