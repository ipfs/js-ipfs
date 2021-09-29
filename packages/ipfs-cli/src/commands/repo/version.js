import parseDuration from 'parse-duration'

export default {
  command: 'version',

  describe: 'Shows IPFS repo version information',

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
    const version = await ipfs.repo.version({
      timeout
    })
    print(`${version}`)
  }
}
