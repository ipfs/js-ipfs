'use strict'

module.exports = {
  command: 'dht <command>',

  description: 'Issue commands directly through the DHT.',

  builder (yargs) {
    return yargs.commandDir('dht')
  },

  handler (argv) {
  }
}
