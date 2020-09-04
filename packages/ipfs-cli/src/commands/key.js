'use strict'

module.exports = {
  command: 'key <command>',

  description: 'Manage your keys',

  builder (yargs) {
    return yargs
      .commandDir('key')
  }
}
