import path, { dirname } from 'path'
import glob from 'it-glob'
import all from 'it-all'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  command: 'commands',

  describe: 'List all available commands',

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   *
   * @returns {Promise<void>}
   */
  async handler ({ ctx }) {
    const { print } = ctx

    const commandsPath = path.resolve(__dirname, '..', 'commands')

    // modelled after https://github.com/vdemedes/ronin/blob/master/lib/program.js#L78
    const files = await all(glob(commandsPath, '**/*.js'))
    const cmds = files.map((p) => {
      return p
        .replace(/\\/g, '/')
        .replace(/\//g, ' ')
        .replace('.js', '')
    })
      .filter(cmd => !cmd.endsWith('index'))
      .sort()
      .map((cmd) => `ipfs ${cmd}`)

    print(['ipfs'].concat(cmds).join('\n'))
  }
}
