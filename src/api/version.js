'use strict'

const command = require('../cmd-helpers').command

module.exports = (send) => {
  return command(send, 'version')
}
