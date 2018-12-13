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

  handler ({ ipfs, ipfsPath, offset, length }) {
    const stream = ipfs.catReadableStream(ipfsPath, { offset, length })

    stream.once('error', (err) => {
      throw err
    })

    stream.pipe(process.stdout)
  }
}
