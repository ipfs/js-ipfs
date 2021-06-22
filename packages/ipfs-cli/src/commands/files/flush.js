'use strict'

const { default: parseDuration } = require('parse-duration')

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

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.path
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
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
