'use strict'

const parseDuration = require('parse-duration').default
const { Buffer } = require('buffer')

module.exports = {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs }, topic, data, timeout }) {
    data = Buffer.from(String(data))
    await ipfs.pubsub.publish(topic, data, {
      timeout
    })
  }
}
