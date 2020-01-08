'use strict'

module.exports = {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  async handler (argv) {
    const data = Buffer.from(String(argv.data))
    await argv.ipfs.api.pubsub.publish(argv.topic, data)
  }
}
