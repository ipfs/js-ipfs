'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return argCommand(send, 'ls')
}
