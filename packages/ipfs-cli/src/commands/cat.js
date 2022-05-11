import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.ipfsPath
 * @property {number} Argv.offset
 * @property {number} Argv.length
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'cat <ipfsPath>',

  describe: 'Fetch and cat an IPFS path referencing a file',

  builder: {
    offset: {
      alias: 'o',
      number: true,
      describe: 'Byte offset to begin reading from'
    },
    length: {
      alias: ['n', 'count'],
      number: true,
      describe: 'Maximum number of bytes to read'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, ipfsPath, offset, length, timeout }) {
    for await (const buf of ipfs.cat(ipfsPath, { offset, length, timeout })) {
      print.write(buf)
    }
  }
}

export default command
