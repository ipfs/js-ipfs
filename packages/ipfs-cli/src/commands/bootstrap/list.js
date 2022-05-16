import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const list = await ipfs.bootstrap.list({
      timeout
    })
    list.Peers.forEach((node) => print(node.toString()))
  }
}

export default command
