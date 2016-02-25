'use strict'

const cmds = require('../cmd-helpers')

module.exports = (send) => {
  const refs = cmds.argCommand(send, 'refs')
  refs.local = cmds.command(send, 'refs/local')

  return refs
}
