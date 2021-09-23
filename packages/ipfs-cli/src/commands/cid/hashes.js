
export default {
  command: 'hashes',

  describe: 'List available multihash hashing algorithm names.',

  builder: {
    numeric: {
      describe: 'Display the numeric code as well as the hashing algorithm name',
      type: 'boolean',
      default: false
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {boolean} [argv.numeric]
   */
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
