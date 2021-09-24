import fs from 'fs'
import concat from 'it-concat'
import parseDuration from 'parse-duration'

export default {
  command: 'put [block]',

  describe: 'Stores input as an IPFS block',

  builder: {
    format: {
      alias: 'f',
      describe: 'cid format for blocks to be created with.',
      default: 'dag-pb'
    },
    mhtype: {
      describe: 'multihash hash function',
      default: 'sha2-256'
    },
    mhlen: {
      describe: 'multihash hash length',
      default: undefined
    },
    version: {
      describe: 'cid version',
      type: 'number',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      default: 'base58btc'
    },
    pin: {
      describe: 'Pin this block recursively',
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.block
   * @param {string} argv.format
   * @param {string} argv.mhtype
   * @param {number} argv.mhlen
   * @param {import('multiformats/cid').CIDVersion} argv.version
   * @param {boolean} argv.pin
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print, getStdin }, block, timeout, format, mhtype, mhlen, version, cidBase, pin }) {
    let data

    if (block) {
      data = fs.readFileSync(block)
    } else {
      data = (await concat(getStdin(), { type: 'buffer' })).slice()
    }

    const cid = await ipfs.block.put(data, {
      timeout,
      format,
      mhtype,
      version,
      pin
    })
    const base = await ipfs.bases.getBase(cidBase)

    print(cid.toString(base.encoder))
  }
}
