import * as dagPB from '@ipld/dag-pb'
import parseDuration from 'parse-duration'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import {
  stripControlCharacters,
  coerceCID
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {'base64' | 'text' | 'hex'} Argv.dataEncoding
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {
    key: {
      string: true,
      coerce: coerceCID
    },
    'data-encoding': {
      string: true,
      default: 'base64'
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

  async handler ({ ctx: { ipfs, print }, key, dataEncoding, cidBase, timeout }) {
    const node = await ipfs.object.get(key, { timeout })

    /** @type {string | undefined} */
    let encoding

    if (dataEncoding === 'base64') {
      encoding = 'base64pad'
    }

    if (dataEncoding === 'text') {
      encoding = 'ascii'
    }

    if (dataEncoding === 'hex') {
      encoding = 'base16'
    }

    const buf = dagPB.encode(node)
    const base = await ipfs.bases.getBase(cidBase)

    const answer = {
      // @ts-expect-error encoding type is wrong
      Data: node.Data ? uint8ArrayToString(node.Data, encoding) : '',
      Hash: key.toString(base.encoder),
      Size: buf.length,
      Links: node.Links.map((l) => {
        return {
          Name: stripControlCharacters(l.Name),
          Size: l.Tsize,
          Hash: l.Hash.toString(base.encoder)
        }
      })
    }

    print(JSON.stringify(answer))
  }
}

export default command
