'use strict'

module.exports = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {},

  handler (argv) {
    const path = require('path')
    const fs = require('fs')
    const utils = require('../../utils')

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
