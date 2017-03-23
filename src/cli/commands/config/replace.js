'use strict'

const path = require('path')
const fs = require('fs')
const utils = require('../../utils')

module.exports = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {},

  handler (argv) {
    if (argv._handled) return
    argv._handled = true

    const filePath = path.resolve(process.cwd(), argv.file)

    const config = utils.isDaemonOn()
      ? filePath : JSON.parse(fs.readFileSync(filePath, 'utf8'))

    argv.ipfs.config.replace(config, (err) => {
      if (err) {
        throw err
      }
    })
  }
}
