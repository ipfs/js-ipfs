'use strict'

module.exports = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const handler = msg => argv.print(msg.data.toString())
      const ipfs = await argv.getIpfs()
      await ipfs.pubsub.subscribe(argv.topic, handler)
    })())
  }
}
