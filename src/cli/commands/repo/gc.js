'use strict'

module.exports = {
  command: 'gc',

  describe: 'Perform a garbage collection sweep on the repo.',

  builder: {},

  handler (argv) {
    argv.ipfs.repo.gc((err) => {
      if (err) {
        throw err
      }
    })
  }
}
