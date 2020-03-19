'use strict'

module.exports = {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {
    'cid-base': {
      describe: 'CID base to use.'
    }
  },

  async handler (argv) {
    const {
      ctx: { ipfs, print },
      path,
      cidBase
    } = argv

    let cid = await ipfs.files.flush(path || '/', {})

    if (cidBase && cidBase !== 'base58btc' && cid.version === 0) {
      cid = cid.toV1()
    }

    print(JSON.stringify({
      Cid: cid.toString(cidBase)
    }))
  }
}
