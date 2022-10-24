import fs from 'fs'
import concat from 'it-concat'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.block
 * @property {string} Argv.format
 * @property {string} Argv.mhtype
 * @property {number} Argv.mhlen
 * @property {import('multiformats/cid').Version} Argv.version
 * @property {boolean} Argv.pin
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'put [block]',

  describe: 'Stores input as an IPFS block',

  builder: {
    format: {
      alias: 'f',
      describe: 'cid format for blocks to be created with',
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
      number: true,
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    pin: {
      describe: 'Pin this block recursively',
      boolean: true,
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print, getStdin }, block, timeout, format, mhtype, mhlen, version, cidBase, pin }) {
    let data

    if (block) {
      data = fs.readFileSync(block)
    } else {
      data = (await concat(getStdin(), { type: 'buffer' })).subarray()
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

export default command
