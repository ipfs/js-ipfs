'use strict'

module.exports = {
  command: 'rm <ipfs-path>',

  describe: 'Removes the pinned object from local storage.',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively unpin the objects linked to by the specified object(s).'
    }
  },

  handler: (argv) => {
    const paths = argv['ipfs-path'].split(' ')
    const recursive = argv.recursive
    argv.ipfs.pin.rm(paths, { recursive }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        console.log(`unpinned ${res.hash}`)
      })
    })
  }
}
