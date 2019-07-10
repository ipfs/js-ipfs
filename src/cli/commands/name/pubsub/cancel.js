'use strict'

module.exports = {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription.',

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const result = await ipfs.name.pubsub.cancel(argv.name)
      argv.print(result.canceled ? 'canceled' : 'no subscription')
    })())
  }
}
