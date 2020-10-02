'use strict'

const path = require('path')
const execa = require('execa')

module.exports = {
  command: 'edit',

  describe: 'Opens the config file for editing in $EDITOR',

  async handler (argv) {
    const editor = process.env.EDITOR

    if (!editor) {
      throw new Error('ENV variable $EDITOR not set')
    }

    await execa(editor, [path.join(argv.ctx.repoPath, 'config')])
  }
}
