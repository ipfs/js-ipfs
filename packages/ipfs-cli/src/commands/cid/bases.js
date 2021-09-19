
export default {
  command: 'bases',

  describe: 'List available multibase encoding names.',

  builder: {
    prefix: {
      describe: 'Display the single letter encoding codes as well as the encoding name.',
      type: 'boolean',
      default: false
    },
    numeric: {
      describe: 'Display the numeric encoding code as well as the encoding name',
      type: 'boolean',
      default: false
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {boolean} [argv.prefix]
   * @param {boolean} [argv.numeric]
   */
  handler ({ ctx: { ipfs, print }, prefix, numeric }) {
    for (const base of ipfs.bases.listBases()) {
      if (prefix && numeric) {
        print(`${base.prefix}\t${base.prefix.charCodeAt(0)}\t${base.name}`)
      } else if (prefix) {
        print(`${base.prefix}\t${base.name}`)
      } else if (numeric) {
        print(`${base.prefix.charCodeAt(0)}\t${base.name}`)
      } else {
        print(base.name)
      }
    }
  }
}
