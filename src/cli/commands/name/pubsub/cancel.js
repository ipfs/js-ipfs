'use strict'

module.exports = {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription.',

  async handler (argv) {
    const result = await argv.ipfs.api.name.pubsub.cancel(argv.name)
    argv.print(result.canceled ? 'canceled' : 'no subscription')
  }
}
