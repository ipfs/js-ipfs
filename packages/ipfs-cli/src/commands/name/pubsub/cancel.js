import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, timeout }) {
    const result = await ipfs.name.pubsub.cancel(name, {
      timeout
    })
    print(result.canceled ? 'canceled' : 'no subscription')
  }
}

export default command
