'use strict'

module.exports = {
  command: 'pubsub <command>',

  description: 'pubsub commands',

  builder (yargs) {
    return yargs
      .commandDir('pubsub')
  },

  handler (argv) {}
}
