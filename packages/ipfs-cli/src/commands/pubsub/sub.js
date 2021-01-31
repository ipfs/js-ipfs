'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, topic, timeout }) {
    const handler = msg => print(msg.data.toString())
    await ipfs.pubsub.subscribe(topic, handler, {
      timeout
    })
  }
}
