import path from 'path'
import fs from 'fs'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.file
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'replace <file>',

  describe: 'Replaces the config with <file>',

  builder: {
    timeout: {
      string: true,
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

export default command
