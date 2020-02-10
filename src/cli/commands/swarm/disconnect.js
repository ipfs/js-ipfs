'use strict'

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  async handler ({ ctx, address }) {
    const { print, ipfs, isDaemon } = ctx
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await ipfs.swarm.disconnect(address)
    res.forEach(msg => print(msg))
  }
}
