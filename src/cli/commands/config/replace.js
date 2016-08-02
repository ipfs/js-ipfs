'use strict'

const debug = require('debug')
const path = require('path')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const utils = require('../../utils')
const fs = require('fs')

module.exports = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {},

  handler (argv) {
    if (argv._handled) return
    argv._handled = true

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const filePath = path.resolve(process.cwd(), argv.file)

      const config = utils.isDaemonOn()
        ? filePath : JSON.parse(fs.readFileSync(filePath, 'utf8'))

      ipfs.config.replace(config, (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
