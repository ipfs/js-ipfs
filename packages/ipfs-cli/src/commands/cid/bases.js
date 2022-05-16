
/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {boolean} [Argv.prefix]
 * @property {boolean} [Argv.numeric]
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'bases',

  describe: 'List available multibase encoding names',

  builder: {
    prefix: {
      describe: 'Display the single letter encoding codes as well as the encoding name',
      boolean: true,
      default: false
    },
    numeric: {
      describe: 'Display the numeric encoding code as well as the encoding name',
      boolean: true,
      default: false
    }
  },

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

export default command
