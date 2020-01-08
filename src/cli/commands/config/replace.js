'use strict'

const path = require('path')
const fs = require('fs')
const utils = require('../../utils')

module.exports = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {},

  handler ({ ipfs, file }) {
    const filePath = path.resolve(process.cwd(), file)

    const config = utils.isDaemonOn()
      ? filePath : JSON.parse(fs.readFileSync(filePath, 'utf8'))

    return ipfs.api.config.replace(config)
  }
}
