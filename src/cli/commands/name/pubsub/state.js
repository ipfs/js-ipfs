'use strict'

module.exports = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  async handler (argv) {
    const result = await argv.ipfs.api.name.pubsub.state()
    argv.print(result.enabled ? 'enabled' : 'disabled')
  }
}
