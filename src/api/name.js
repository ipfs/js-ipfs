'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    publish: argCommand(send, 'name/publish'),
    resolve: argCommand(send, 'name/resolve')
  }
}
