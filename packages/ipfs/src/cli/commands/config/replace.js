'use strict'

const path = require('path')
const fs = require('fs')

module.exports = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  handler ({ ctx, file }) {
    const { ipfs, isDaemon } = ctx

    const filePath = path.resolve(process.cwd(), file)

    const config = isDaemon
      ? filePath : JSON.parse(fs.readFileSync(filePath, 'utf8'))

    return ipfs.config.replace(config)
  }
}
