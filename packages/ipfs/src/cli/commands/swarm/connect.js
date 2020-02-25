'use strict'

module.exports = {
  command: 'connect <address>',

  describe: 'Open connection to a given address',

  async handler ({ ctx, address }) {
    const { print, ipfs, isDaemon } = ctx
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await ipfs.swarm.connect(address)
    res.forEach(msg => print(msg))
  }
}
