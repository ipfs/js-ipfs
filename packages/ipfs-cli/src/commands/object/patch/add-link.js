import * as dagPB from '@ipld/dag-pb'
import parseDuration from 'parse-duration'
import { coerceCID } from '../../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.root
 * @property {string} Argv.name
 * @property {import('multiformats/cid').CID} Argv.ref
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    root: {
      string: true,
      coerce: coerceCID
    },
    ref: {
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

  async handler ({ ctx: { ipfs, print }, root, name, ref, cidBase, timeout }) {
    const nodeA = await ipfs.object.get(ref, { timeout })
    const block = dagPB.encode(nodeA)
    const cid = await ipfs.object.patch.addLink(root, {
      Name: name,
      Hash: ref,
      Tsize: block.length
    }, { timeout })
    const base = await ipfs.bases.getBase(cidBase)
    print(cid.toString(base.encoder))
  }
}

export default command
