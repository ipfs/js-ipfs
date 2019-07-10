'use strict'

module.exports = {
  command: 'resolve [<name>]',

  describe: 'Resolve IPNS names.',

  builder: {
    nocache: {
      type: 'boolean',
      alias: 'n',
      describe: 'Do not use cached entries. Default: false.',
      default: false
    },
    recursive: {
      type: 'boolean',
      alias: 'r',
      describe: 'Resolve until the result is not an IPNS name. Default: true.',
      default: true
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const opts = {
        nocache: argv.nocache,
        recursive: argv.recursive
      }

      const ipfs = await argv.getIpfs()
      const result = await ipfs.name.resolve(argv.name, opts)

      argv.print(result)
    })())
  }
}
