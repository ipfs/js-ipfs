'use strict'

module.exports = {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  async handler (argv) {
    const { ipfs } = argv.ctx
    const data = Buffer.from(String(argv.data))
    await ipfs.pubsub.publish(argv.topic, data)
  }
}
