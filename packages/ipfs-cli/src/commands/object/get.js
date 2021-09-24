import * as dagPB from '@ipld/dag-pb'
import parseDuration from 'parse-duration'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import {
  stripControlCharacters,
  coerceCID
} from '../../utils.js'

export default {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
    'data-encoding': {
      type: 'string',
      default: 'base64'
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
   * @param {'base64' | 'text' | 'hex'} argv.dataEncoding
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
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
      // @ts-ignore encoding type is wrong
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
