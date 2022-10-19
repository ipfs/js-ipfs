import concat from 'it-concat'
import fs from 'fs'
import parseDuration from 'parse-duration'
import { coerceCID } from '../../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.root
 * @property {string} Argv.data
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'append-data <root> [data]',

  describe: 'Append data to the data segment of a dag node',

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

  async handler ({ ctx: { ipfs, print, getStdin }, root, data, cidBase, timeout }) {
    let buf

    if (data) {
      buf = fs.readFileSync(data)
    } else {
      buf = (await concat(getStdin(), { type: 'buffer' })).subarray()
    }

    const cid = await ipfs.object.patch.appendData(root, buf, {
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)

    print(cid.toString(base.encoder))
  }
}

export default command
