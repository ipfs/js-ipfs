import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {boolean} Argv.nocache
 * @property {boolean} Argv.recursive
 * @property {boolean} Argv.stream
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'resolve <name>',

  describe: 'Resolve IPNS names',

  builder: {
    nocache: {
      boolean: true,
      alias: 'n',
      describe: 'Do not use cached entries. Default: false',
      default: false
    },
    recursive: {
      boolean: true,
      alias: 'r',
      describe: 'Resolve until the result is not an IPNS name. Default: true',
      default: true
    },
    stream: {
      boolean: true,
      alias: 's',
      describe: 'Stream entries as they are found',
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, nocache, recursive, name, stream, timeout }) {
    let bestValue

    for await (const value of ipfs.name.resolve(name, { nocache, recursive, timeout })) {
      bestValue = value
      if (stream) print(value)
    }

    if (!stream) print(bestValue || '')
  }
}

export default command
