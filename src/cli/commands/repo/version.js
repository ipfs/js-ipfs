'use strict'

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    argv.ipfs.repo.version(function (err, version) {
      if (err) {
        return console.error(err)
      }
      console.log(version)
    })
  }
}
