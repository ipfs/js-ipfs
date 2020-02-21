'use strict'

module.exports = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const result = await ipfs.name.pubsub.state()
      argv.print(result.enabled ? 'enabled' : 'disabled')
    })())
  }
}
