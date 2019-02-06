'use strict'

module.exports = {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const data = Buffer.from(String(argv.data))
      const ipfs = await argv.getIpfs()
      await ipfs.pubsub.publish(argv.topic, data)
    })())
  }
}
