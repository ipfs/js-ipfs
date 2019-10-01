'use strict'

module.exports = {
  command: 'ls <key>',

  describe: 'List directory contents for Unix filesystem objects.',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const path = argv.key
      // `ipfs file ls` is deprecated. See https://ipfs.io/docs/commands/#ipfs-file-ls
      argv.print('This functionality is deprecated, and will be removed in future versions. If possible, please use \'ipfs ls\' instead.')

      const ipfs = await argv.getIpfs()
      let links = await ipfs.ls(path)

      // Single file? Then print its hash
      if (links.length === 0) {
        links = [{ hash: path }]
      }

      links.forEach((file) => argv.print(file.hash))
    })())
  }
}
