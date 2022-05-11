import parseDuration from 'parse-duration'
import { coerceCID } from '../../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.root
 * @property {string} Argv.link
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    root: {
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

  async handler ({ ctx: { ipfs, print }, root, link, cidBase, timeout }) {
    const cid = await ipfs.object.patch.rmLink(root, link, {
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)

    print(cid.toString(base.encoder))
  }
}

export default command
