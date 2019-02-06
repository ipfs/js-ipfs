'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const handler = msg => print(msg.data.toString())
      const ipfs = await argv.getIpfs()
      await ipfs.pubsub.subscribe(argv.topic, handler)
    })())
  }
}
