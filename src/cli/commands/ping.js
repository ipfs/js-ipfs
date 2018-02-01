'use strict'

const print = require('../utils').print

module.exports = {
  command: 'ping <peerId>',

  describe: 'Measure the latency of a connection',

  builder: {
    count: {
      alias: 'n',
      type: 'integer',
      default: 10
    }
  },

  handler (argv) {
    const peerId = argv.peerId
    const count = argv.count || 10

    print('PING ' + peerId)

    let noOfTimes = 0
    let totalTime = 0

    const pingCb = (err, p) => {
      if (err) {
        throw err
      }
      let time = p.Time
      totalTime = totalTime + time
      noOfTimes = noOfTimes + 1
      print('Pong received: time=' + time + ' ms')
      if (noOfTimes === count) {
        print('Average latency: ' + totalTime / count + 'ms')
      }
    }

    for (let i = 0; i < count; i++) {
      argv.ipfs.ping(peerId, pingCb)
    }
  }
}
