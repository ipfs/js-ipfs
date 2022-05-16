import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {number} Argv.offset
 * @property {number} Argv.length
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'read <path>',

  describe: 'Read an mfs file',

  builder: {
    offset: {
      alias: 'o',
      number: true,
      describe: 'Start writing at this offset'
    },
    length: {
      alias: 'l',
      number: true,
      describe: 'Write only this number of bytes'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs, print },
    path,
    offset,
    length,
    timeout
  }) {
    for await (const buffer of ipfs.files.read(path, {
      offset,
      length,
      timeout
    })) {
      print(buffer, false)
    }
  }
}

export default command
