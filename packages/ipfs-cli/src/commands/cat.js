'use strict'

const parseDuration = require('parse-duration').default
const uint8ArrayToString = require('uint8arrays/to-string')

module.exports = {
  command: 'cat <ipfsPath>',

  describe: 'Fetch and cat an IPFS path referencing a file',

  builder: {
    offset: {
      alias: 'o',
      type: 'integer',
      describe: 'Byte offset to begin reading from'
    },
    length: {
      alias: ['n', 'count'],
      type: 'integer',
      describe: 'Maximum number of bytes to read'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, ipfsPath, offset, length, timeout }) {
    for await (const buf of ipfs.cat(ipfsPath, { offset, length, timeout })) {
      print.write(uint8ArrayToString(buf))
    }
  }
}
