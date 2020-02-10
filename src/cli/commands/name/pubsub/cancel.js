'use strict'

module.exports = {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription.',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const result = await ipfs.name.pubsub.cancel(argv.name)
    print(result.canceled ? 'canceled' : 'no subscription')
  }
}
