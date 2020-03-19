'use strict'

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
    }
  },

  async handler (argv) {
    const {
      ctx: { ipfs, print },
      path,
      offset,
      length
    } = argv

    for await (const buffer of ipfs.files.read(path, {
      offset,
      length
    })) {
      print(buffer, false)
    }
  }
}
