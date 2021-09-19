
import path from 'path'
import glob from 'it-glob'
import all from 'it-all'

export default {
  command: 'commands',

  describe: 'List all available commands',

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   */
  async handler ({ ctx }) {
    const { print } = ctx

    const commandsPath = path.resolve(__dirname, '..', 'commands')

    // modeled after https://github.com/vdemedes/ronin/blob/master/lib/program.js#L78
    const files = await all(glob(commandsPath, '**/*.js'))
    const cmds = files.map((p) => {
      return p
        .replace(/\\/g, '/')
        .replace(/\//g, ' ')
        .replace('.js', '')
    }).sort().map((cmd) => `ipfs ${cmd}`)

    print(['ipfs'].concat(cmds).join('\n'))
  }
}
