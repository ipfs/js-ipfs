
/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {boolean} [Argv.numeric]
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'hashes',

  describe: 'List available multihash hashing algorithm names',

  builder: {
    numeric: {
      describe: 'Display the numeric code as well as the hashing algorithm name',
      boolean: true,
      default: false
    }
  },

  handler ({ ctx: { ipfs, print }, numeric }) {
    for (const codec of ipfs.hashers.listHashers()) {
      if (numeric) {
        print(`${codec.code}\t${codec.name}`)
      } else {
        print(codec.name)
      }
    }
  }
}

export default command
