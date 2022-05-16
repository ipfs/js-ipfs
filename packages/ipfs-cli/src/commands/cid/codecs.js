
/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {boolean} [Argv.numeric]
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'codecs',

  describe: 'List available CID codec names',

  builder: {
    numeric: {
      describe: 'Display the numeric code as well as the codec name',
      boolean: true,
      default: false
    }
  },

  handler ({ ctx: { ipfs, print }, numeric }) {
    for (const codec of ipfs.codecs.listCodecs()) {
      if (numeric) {
        print(`${codec.code}\t${codec.name}`)
      } else {
        print(codec.name)
      }
    }
  }
}

export default command
