import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    for (const profile of await ipfs.config.profiles.list({
      timeout
    })) {
      print(`${profile.name}:\n ${profile.description}`)
    }
  }
}

export default command
