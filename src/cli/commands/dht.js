'use strict'

/*
Issue commands directly through the DHT.
*/
module.exports = {
  command: 'dht <command>',

  description: 'Issue commands directly through the DHT.',

  builder (yargs) {
    return yargs.commandDir('dht')
  },

  handler (argv) {
  }
}
