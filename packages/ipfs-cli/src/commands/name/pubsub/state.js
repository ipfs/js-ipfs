import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const result = await ipfs.name.pubsub.state({
      timeout
    })
    print(result.enabled ? 'enabled' : 'disabled')
  }
}

export default command
