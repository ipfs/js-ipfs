'use strict'

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const version = await ipfs.repo.version()
    print(version)
  }
}
