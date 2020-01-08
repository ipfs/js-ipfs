'use strict'

module.exports = {
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
    }
  },

  async handler ({ ipfs, ipfsPath, offset, length, print }) {
    for await (const buf of ipfs.cat(ipfsPath, { offset, length })) {
      process.stdout.write(buf)
    }
  }
}
