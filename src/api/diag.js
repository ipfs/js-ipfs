'use strict'

const command = require('../cmd-helpers').command

module.exports = (send) => {
  return {
    net: command(send, 'diag/net'),
    sys: command(send, 'diag/sys'),
    cmds: command(send, 'diag/sys')
  }
}
