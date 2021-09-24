import fs from 'fs'
import concat from 'it-concat'
import parseDuration from 'parse-duration'
import { coerceCID } from '../../../utils.js'

export default {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

  builder: {
    root: {
      type: 'string',
      coerce: coerceCID
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      default: 'base58btc'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.root
   * @param {string} argv.data
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print, getStdin }, root, data, cidBase, timeout }) {
    let buf

    if (data) {
      buf = fs.readFileSync(data)
    } else {
      buf = (await concat(getStdin(), { type: 'buffer' })).slice()
    }

    const cid = await ipfs.object.patch.setData(root, buf, {
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    print(cid.toString(base.encoder))
  }
}
