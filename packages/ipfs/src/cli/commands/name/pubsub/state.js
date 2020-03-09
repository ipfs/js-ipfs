'use strict'

module.exports = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const result = await ipfs.name.pubsub.state()
    print(result.enabled ? 'enabled' : 'disabled')
  }
}
