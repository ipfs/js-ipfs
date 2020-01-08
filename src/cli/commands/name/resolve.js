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

  async handler ({ ipfs, nocache, recursive, name, print, stream }) {
    let bestValue

    for await (const value of ipfs.name.resolve(name, { nocache, recursive })) {
      bestValue = value
      if (stream) print(value)
    }

    if (!stream) print(bestValue)
  }
}
