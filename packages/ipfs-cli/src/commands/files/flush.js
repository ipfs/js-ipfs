'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {
    'cid-base': {
      describe: 'CID base to use.'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs, print },
    path,
    cidBase,
    timeout
  }) {
    let cid = await ipfs.files.flush(path || '/', {
      timeout
    })

    if (cidBase && cidBase !== 'base58btc' && cid.version === 0) {
      cid = cid.toV1()
    }

    print(JSON.stringify({
      Cid: cid.toString(cidBase)
    }))
  }
}
