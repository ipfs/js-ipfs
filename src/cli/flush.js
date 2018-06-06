'use strict'

const {
  FILE_SEPARATOR
} = require('../core/utils')

module.exports = {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {},

  handler (argv) {
    let {
      path,
      ipfs
    } = argv

    return ipfs.files.flush(path || FILE_SEPARATOR, {})
  }
}
