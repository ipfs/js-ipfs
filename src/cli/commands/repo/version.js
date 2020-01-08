'use strict'

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  async handler (argv) {
    const version = await argv.ipfs.api.repo.version()
    argv.print(version)
  }
}
