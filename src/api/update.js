'use strict'

const command = require('../cmd-helpers').command

module.exports = (send) => {
  return {
    apply: command(send, 'update'),
    check: command(send, 'update/check'),
    log: command(send, 'update/log')
  }
}
