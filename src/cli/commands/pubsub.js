'use strict'

module.exports = {
  command: 'pubsub',

  description: 'pubsub commands',

  builder (yargs) {
    return yargs
      .commandDir('pubsub')
  },

  handler (argv) {}
}
