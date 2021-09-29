
export default {
  command: 'codecs',

  describe: 'List available CID codec names.',

  builder: {
    numeric: {
      describe: 'Display the numeric code as well as the codec name',
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
    for (const codec of ipfs.codecs.listCodecs()) {
      if (numeric) {
        print(`${codec.code}\t${codec.name}`)
      } else {
        print(codec.name)
      }
    }
  }
}
