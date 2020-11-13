'use strict'

const parseDuration = require('parse-duration').default
const uint8ArrayFromString = require('uint8arrays/from-string')

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
    data = uint8ArrayFromString(String(data))
    await ipfs.pubsub.publish(topic, data, {
      timeout
    })
  }
}
