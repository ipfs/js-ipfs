import parseDuration from 'parse-duration'
import {
  stripControlCharacters,
  coerceCID
} from '../../utils.js'

export default {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {
    key: {
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
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.key
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, key, cidBase, timeout }) {
    const links = await ipfs.object.links(key, { timeout })
    const base = await ipfs.bases.getBase(cidBase)

    links.forEach((link) => {
      const cidStr = link.Hash.toString(base.encoder)
      print(`${cidStr} ${link.Tsize} ${stripControlCharacters(link.Name)}`)
    })
  }
}
