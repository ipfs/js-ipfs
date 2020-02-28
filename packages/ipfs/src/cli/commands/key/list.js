'use strict'

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const keys = await ipfs.key.list()
    keys.forEach((ki) => print(`${ki.id} ${ki.name}`))
  }
}
