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

  async handler ({ ctx, ipfsPath, offset, length }) {
    const { ipfs, print } = ctx

    for await (const buf of ipfs.cat(ipfsPath, { offset, length })) {
      print.write(buf)
    }
  }
}
