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

  handler (argv) {
    let path = argv['ipfsPath']
    if (path.indexOf('/ipfs/') !== 1) {
      path = path.replace('/ipfs/', '')
    }

    const options = {
      offset: argv.offset,
      length: argv.length
    }

    const stream = argv.ipfs.files.catReadableStream(path, options)

    stream.once('error', (err) => {
      throw err
    })

    stream.pipe(process.stdout)
  }
}
