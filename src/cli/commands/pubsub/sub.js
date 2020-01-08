'use strict'

module.exports = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  async handler (argv) {
    const handler = msg => argv.print(msg.data.toString())
    await argv.ipfs.api.pubsub.subscribe(argv.topic, handler)
  }
}
