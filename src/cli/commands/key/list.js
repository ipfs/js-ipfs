'use strict'

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  async handler (argv) {
    const keys = await argv.ipfs.api.key.list()
    keys.forEach((ki) => argv.print(`${ki.id} ${ki.name}`))
  }
}
