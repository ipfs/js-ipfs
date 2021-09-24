import parseDuration from 'parse-duration'

export default {
  command: 'cat <ipfsPath>',

  describe: 'Fetch and cat an IPFS path referencing a file',

  builder: {
    offset: {
      alias: 'o',
      type: 'integer',
      describe: 'Byte offset to begin reading from'
    },
    length: {
      alias: ['n', 'count'],
      type: 'integer',
      describe: 'Maximum number of bytes to read'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {string} argv.ipfsPath
   * @param {number} argv.offset
   * @param {number} argv.length
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, ipfsPath, offset, length, timeout }) {
    for await (const buf of ipfs.cat(ipfsPath, { offset, length, timeout })) {
      print.write(buf)
    }
  }
}
