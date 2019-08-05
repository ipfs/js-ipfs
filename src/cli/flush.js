'use strict'

const {
  FILE_SEPARATOR
} = require('../core/utils/constants')

module.exports = {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {},

  handler (argv) {
    const {
      path,
      getIpfs
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()
      return ipfs.files.flush(path || FILE_SEPARATOR, {})
    })())
  }
}
