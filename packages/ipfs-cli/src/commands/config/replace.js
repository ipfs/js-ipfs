'use strict'

const path = require('path')
const fs = require('fs')
const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  handler ({ ctx: { ipfs, isDaemon }, file, timeout }) {
    const filePath = path.resolve(process.cwd(), file)

    const config = isDaemon
      ? filePath
      : JSON.parse(fs.readFileSync(filePath, 'utf8'))

    return ipfs.config.replace(config, {
      timeout
    })
  }
}
