import path from 'path'
import execa from 'execa'

export default {
  command: 'edit',

  describe: 'Opens the config file for editing in $EDITOR',

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   */
  async handler (argv) {
    const editor = process.env.EDITOR

    if (!editor) {
      throw new Error('ENV variable $EDITOR not set')
    }

    await execa(editor, [path.join(argv.ctx.repoPath, 'config')])
  }
}
