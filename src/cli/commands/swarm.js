'use strict'

module.exports = {
  command: 'swarm',

  description: 'Swarm inspection tool.',

  builder (yargs) {
    return yargs
      .commandDir('swarm')
  },

  handler (argv) {
  }
}
