import parseDuration from 'parse-duration'
import { toCidAndPath } from 'ipfs-core-utils/to-cid-and-path'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import {
  stripControlCharacters,
  makeEntriesPrintable,
  escapeControlCharacters
} from '../../utils.js'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'

export default {
  command: 'get <cid path>',

  describe: 'Get a dag node or value from ipfs.',

  builder: {
    'local-resolve': {
      type: 'boolean',
      default: false
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      default: 'base58btc'
    },
    'data-enc': {
      describe: 'String encoding to display data in.',
      type: 'string',
      choices: ['base16', 'base64', 'base58btc'],
      default: 'base64'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.cidpath
   * @param {string} argv.cidBase
   * @param {'base16' | 'base64' | 'base58btc'} argv.dataEnc
   * @param {boolean} argv.localResolve
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, cidpath, cidBase, dataEnc, localResolve, timeout }) {
    const options = {
      localResolve,
      timeout
    }

    const {
      cid, path
    } = toCidAndPath(cidpath)

    let result

    try {
      result = await ipfs.dag.get(cid, {
        ...options,
        path
      })
    } catch (/** @type {any} */ err) {
      return print(`dag get failed: ${err}`)
    }

    if (options.localResolve) {
      print('resolving path within the node only')
      print(`remainder path: ${result.remainderPath || 'n/a'}\n`)
    }

    const node = result.value
    const base = await ipfs.bases.getBase(cidBase)

    // TODO: just plain dag-json output by default, or use output-codec
    if (cid.code === dagPB.code) {
      /** @type {import('@ipld/dag-pb').PBNode} */
      const dagNode = node

      print(JSON.stringify({
        data: dagNode.Data ? uint8ArrayToString(node.Data, dataEnc) : undefined,
        links: (dagNode.Links || []).map(link => ({
          Name: stripControlCharacters(link.Name),
          Size: link.Tsize,
          Cid: { '/': link.Hash.toString(base.encoder) }
        }))
      }))
    } else if (cid.code === raw.code) {
      print(uint8ArrayToString(node, dataEnc))
    } else if (cid.code === dagCBOR.code || cid.code === dagJSON.code) {
      print(JSON.stringify(makeEntriesPrintable(node, base)))
    } else {
      print(escapeControlCharacters(node.toString()))
    }
  }
}
