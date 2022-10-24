import concat from 'it-concat'
import * as dagPB from '@ipld/dag-pb'
import parseDuration from 'parse-duration'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.data
 * @property {'json' | 'protobuf'} Argv.inputEnc
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'put [data]',

  describe: 'Stores input as a DAG object, outputs its key',

  builder: {
    'input-enc': {
      string: true,
      choices: ['json', 'protobuf'],
      default: 'json'
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

  async handler ({ ctx: { ipfs, print, getStdin }, data, inputEnc, cidBase, timeout }) {
    let buf

    if (data) {
      buf = uint8ArrayFromString(data)
    } else {
      buf = (await concat(getStdin(), { type: 'buffer' })).subarray()
    }

    let node

    if (inputEnc === 'protobuf') {
      node = dagPB.decode(buf)
    } else {
      node = JSON.parse(uint8ArrayToString(buf))
    }

    const base = await ipfs.bases.getBase(cidBase)

    const cid = await ipfs.object.put(node, { timeout })
    print(`added ${cid.toString(base.encoder)}`)
  }
}

export default command
