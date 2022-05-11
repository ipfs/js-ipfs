import path from 'path'
import { execa } from 'execa'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'edit',

  describe: 'Opens the config file for editing in $EDITOR',

  async handler ({ ctx: { repoPath } }) {
    const editor = process.env.EDITOR

    if (!editor) {
      throw new Error('ENV variable $EDITOR not set')
    }

    await execa(editor, [path.join(repoPath, 'config')])
  }
}

export default command
