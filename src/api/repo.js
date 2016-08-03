'use strict'

const cmds = require('../cmd-helpers')

module.exports = (send) => {
  return {
    gc: cmds.command(send, 'repo/gc'),
    stat: cmds.command(send, 'repo/stat')
  }
}
