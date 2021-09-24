import parseDuration from 'parse-duration'

export default {
  command: 'ping <peerId>',

  description: 'Measure the latency of a connection',

  builder: {
    count: {
      alias: 'n',
      type: 'integer',
      default: 10
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {number} argv.count
   * @param {string} argv.peerId
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, count, peerId, timeout }) {
    for await (const pong of ipfs.ping(peerId, { count, timeout })) {
      const { success, time, text } = pong
      // Check if it's a pong
      if (success && !text) {
        print(`Pong received: time=${time} ms`)
        // Status response
      } else {
        print(text)
      }
    }
  }
}
