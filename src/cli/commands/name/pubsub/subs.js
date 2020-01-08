'use strict'

module.exports = {
  command: 'subs',

  describe: 'Show current name subscriptions.',

  async handler (argv) {
    const result = await argv.ipfs.api.name.pubsub.subs()
    result.forEach(s => argv.print(s))
  }
}
