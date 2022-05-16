import parseDuration from 'parse-duration'
import {
  stripControlCharacters,
  coerceCID
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {
    key: {
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

  async handler ({ ctx: { ipfs, print }, key, cidBase, timeout }) {
    const links = await ipfs.object.links(key, { timeout })
    const base = await ipfs.bases.getBase(cidBase)

    links.forEach((link) => {
      const cidStr = link.Hash.toString(base.encoder)
      print(`${cidStr} ${link.Tsize} ${stripControlCharacters(link.Name)}`)
    })
  }
}

export default command
