import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'flush [path]',

  describe: ' Flush a given path\'s data to disk',

  builder: {
    'cid-base': {
      describe: 'CID base to use',
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
