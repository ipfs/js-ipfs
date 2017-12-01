'use strict'

module.exports = {
  command: 'cat <ipfs-path>',

  describe: 'Fetch and cat an IPFS path referencing a file',

  builder: {},

  handler (argv) {
    let path = argv['ipfs-path']
    if (path.indexOf('/ipfs/') !== 1) {
      path = path.replace('/ipfs/', '')
    }

    const stream = argv.ipfs.files.catReadableStream(path)

    stream.once('error', (err) => {
      throw err
    })

    stream.pipe(process.stdout)
  }
}
