'use strict'

const {
  FILE_SEPARATOR
} = require('../core/utils/constants')

module.exports = {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {
    'cid-base': {
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    const {
      path,
      getIpfs,
      cidBase,
      print
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()
      let cid = await ipfs.files.flush(path || FILE_SEPARATOR, {})

      if (cidBase && cidBase !== 'base58btc' && cid.version === 0) {
        cid = cid.toV1()
      }

      print(JSON.stringify({
        Cid: cid.toString(cidBase)
      }))
    })())
  }
}
