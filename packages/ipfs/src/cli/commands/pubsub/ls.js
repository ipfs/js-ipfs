'use strict'

module.exports = {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const subscriptions = await ipfs.pubsub.ls()
    subscriptions.forEach(sub => print(sub))
  }
}
