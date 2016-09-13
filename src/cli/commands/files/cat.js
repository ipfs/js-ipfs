'use strict'

const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')

module.exports = {
  command: 'cat <ipfs-path>',

  describe: 'Download IPFS objects',

  builder: {},

  handler (argv) {
    const path = argv['ipfs-path']
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.files.cat(path, onFile)
    })
  }
}

function onFile (err, file) {
  if (err) {
    throw (err)
  }
  file.pipe(process.stdout)
}
