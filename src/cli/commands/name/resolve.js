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
    },
    stream: {
      type: 'boolean',
      alias: 's',
      describe: 'Stream entries as they are found.',
      default: false
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const opts = {
        nocache: argv.nocache,
        recursive: argv.recursive
      }

      const ipfs = await argv.getIpfs()
      let bestValue

      for await (const value of ipfs.name.resolve(argv.name, opts)) {
        bestValue = value
        if (argv.stream) argv.print(value)
      }

      if (!argv.stream) argv.print(bestValue)
    })())
  }
}
