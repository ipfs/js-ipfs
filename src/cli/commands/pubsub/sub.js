'use strict'

module.exports = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const handler = msg => print(msg.data.toString())
    await ipfs.pubsub.subscribe(argv.topic, handler)
  }
}
