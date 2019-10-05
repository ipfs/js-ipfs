'use strict'

module.exports = {
  command: 'rm <hash...>',

  describe: 'Remove IPFS block(s)',

  builder: {
    force: {
      alias: 'f',
      describe: 'Ignore nonexistent blocks',
      type: 'boolean',
      default: false
    },
    quiet: {
      alias: 'q',
      describe: 'Write minimal output',
      type: 'boolean',
      default: false
    }
  },

  handler ({ getIpfs, print, hash, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      let errored = false

      for await (const result of ipfs.block._rmAsyncIterator(hash)) {
        if (result.error) {
          errored = true
        }

        print(result.error || 'removed ' + result.hash)
      }

      if (errored) {
        print('Error: some blocks not removed')
      }
    })())
  }
}
