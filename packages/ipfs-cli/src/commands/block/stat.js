import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {
    key: {
      string: true,
      coerce: coerceCID
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx, key, cidBase, timeout }) {
    const { ipfs, print } = ctx
    const stats = await ipfs.block.stat(key, {
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)
    print('Key: ' + stats.cid.toString(base.encoder))
    print('Size: ' + stats.size)
  }
}

export default command
