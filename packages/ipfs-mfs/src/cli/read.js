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

  handler (argv) {
    const {
      path,
      getIpfs,
      print,
      offset,
      length
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      for await (const buffer of ipfs.files.read(path, {
        offset,
        length
      })) {
        print(buffer, false)
      }
    })())
  }
}
