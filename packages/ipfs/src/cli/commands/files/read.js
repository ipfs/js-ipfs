'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'read <path>',

  describe: 'Read an mfs file',

  builder: {
    offset: {
      alias: 'o',
      type: 'number',
      describe: 'Start writing at this offset'
    },
    length: {
      alias: 'l',
      type: 'number',
      describe: 'Write only this number of bytes'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs, print },
    path,
    offset,
    length,
    timeout
  }) {
    for await (const buffer of ipfs.files.read(path, {
      offset,
      length,
      timeout
    })) {
      print(buffer, false)
    }
  }
}
