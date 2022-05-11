import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  handler ({ ctx: { ipfs }, timeout }) {
    // @ts-expect-error not part of the core api
    return ipfs.shutdown({
      timeout
    })
  }
}

export default command
