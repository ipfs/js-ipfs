import parseDuration from 'parse-duration'

export default {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {
    'cid-base': {
      describe: 'CID base to use',
      default: 'base58btc'
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
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({
    ctx: { ipfs, print },
    path,
    cidBase,
    timeout
  }) {
    const cid = await ipfs.files.flush(path || '/', {
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    print(JSON.stringify({
      Cid: cid.toString(base.encoder)
    }))
  }
}
