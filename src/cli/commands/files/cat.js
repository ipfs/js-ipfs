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
    const path = argv.ipfsPath
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      if (utils.isDaemonOn()) {
        ipfs.cat(path, (err, res) => {
          if (err) {
            throw err
          }
          console.log(res.toString())
        })
        return
      }
      ipfs.files.cat(path, (err, file) => {
        if (err) {
          throw (err)
        }
        file.pipe(process.stdout)
      })
    })
  }
}
