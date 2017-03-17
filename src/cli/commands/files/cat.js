'use strict'

module.exports = {
  command: 'cat <ipfs-path>',

  describe: 'Download IPFS objects',

  builder: {},

  handler (argv) {
    let path = argv['ipfs-path']
    if (path.indexOf('/ipfs/') !== 1) {
      path = path.replace('/ipfs/', '')
    }

    argv.ipfs.files.cat(path, (err, file) => {
      if (err) {
        throw err
      }

      file.pipe(process.stdout)
    })
  }
}
