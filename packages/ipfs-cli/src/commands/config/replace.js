import path from 'path'
import fs from 'fs'
import parseDuration from 'parse-duration'

export default {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.file
   * @param {number} argv.timeout
   */
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
