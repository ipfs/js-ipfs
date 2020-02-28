'use strict'

module.exports = {
  command: 'subs',

  describe: 'Show current name subscriptions.',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const result = await ipfs.name.pubsub.subs()
    result.forEach(s => print(s))
  }
}
