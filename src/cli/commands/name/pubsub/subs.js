'use strict'

module.exports = {
  command: 'subs',

  describe: 'Show current name subscriptions.',

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const result = await ipfs.name.pubsub.subs()
      result.forEach(s => argv.print(s))
    })())
  }
}
