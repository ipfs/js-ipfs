import parseDuration from 'parse-duration'
import { toCidAndPath } from 'ipfs-core-utils/to-cid-and-path'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'

/**
 * @template T
 * @typedef {import('multiformats/codecs/interface').BlockCodec<number, T>} BlockCodec
 */

const codecs = [dagCBOR, dagJSON, dagPB, raw].reduce((/** @type {Record<string, BlockCodec<any>>} */ m, codec) => {
  m[codec.name] = codec
  return m
}, /** @type {Record<string, BlockCodec<any>>} */ {})

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.cidpath
 * @property {'dag-json' | 'dag-cbor' | 'dag-pb' | 'raw'} Argv.outputCodec
 * @property {'base16' | 'base64' | 'base58btc'} Argv.dataEnc
 * @property {boolean} Argv.localResolve
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'get <cid path>',

  describe: 'Get a dag node or value from ipfs',

  builder: {
    'local-resolve': {
      boolean: true,
      default: false
    },
    'output-codec': {
      describe: 'Codec to encode data in before displaying',
      string: true,
      choices: ['dag-json', 'dag-cbor', 'dag-pb', 'raw'],
      default: 'dag-json'
    },
    'data-enc': {
      describe: 'String encoding to display raw node data in if using "raw" output-codec',
      string: true,
      choices: ['base16', 'base64', 'base58btc']
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, cidpath, dataEnc, outputCodec, localResolve, timeout }) {
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

    if (outputCodec === 'raw') {
      if (!(node instanceof Uint8Array)) {
        print('dag get cannot print a non-bytes node as "raw"')
        return
      }
      if (dataEnc) {
        print(uint8ArrayToString(node, dataEnc), false)
      } else {
        print.write(node)
      }
    } else {
      const codec = codecs[outputCodec]
      if (!codec) {
        print(`unsupported codec "${outputCodec}"`)
        return
      }
      const output = codec.encode(node)
      print(output, false)
    }
  }
}

export default command
