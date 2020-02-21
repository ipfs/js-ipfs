'use strict'

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const version = await ipfs.repo.version()
      argv.print(version)
    })())
  }
}
