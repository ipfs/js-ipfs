'use strict'

module.exports = {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  async handler (argv) {
    const subscriptions = await argv.ipfs.api.pubsub.ls()
    subscriptions.forEach(sub => argv.print(sub))
  }
}
