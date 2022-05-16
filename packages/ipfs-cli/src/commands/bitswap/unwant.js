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
  command: 'unwant <key>',

  describe: 'Removes a given block from your wantlist',

  builder: {
    key: {
      alias: 'k',
      describe: 'Key to remove from your wantlist',
      string: true,
      coerce: coerceCID
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect',
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
    const base = await ipfs.bases.getBase(cidBase)
    await ipfs.bitswap.unwant(key, {
      timeout
    })
    print(`Key ${key.toString(base.encoder)} removed from wantlist`)
  }
}

export default command
