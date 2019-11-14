'use strict'

module.exports = {
  command: 'stat',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      type: 'boolean',
      default: false
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const stats = await ipfs.repo.stat({ human: argv.human })
      argv.print(
`NumObjects: ${stats.numObjects}
RepoSize: ${stats.repoSize}
StorageMax: ${stats.storageMax}
RepoPath: ${stats.repoPath}
Version: ${stats.version}`)
    })())
  }
}
