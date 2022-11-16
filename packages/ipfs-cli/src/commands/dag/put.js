import * as dagCBOR from '@ipld/dag-cbor'
import * as dagPB from '@ipld/dag-pb'
import * as dagJSON from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'
import concat from 'it-concat'
import parseDuration from 'parse-duration'

/**
 * @template T
 * @typedef {import('multiformats/codecs/interface').BlockCodec<number, T>} BlockCodec
 */

/**
 * @type {Record<string, BlockCodec<any>>}
 */
const codecs = [dagCBOR, dagJSON, dagPB, raw].reduce((/** @type {Record<string, BlockCodec<any>>} */ m, codec) => {
  m[codec.name] = codec
  return m
}, /** @type {Record<string, BlockCodec<any>>} */ {})

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.data
 * @property {'dag-cbor' | 'dag-json' | 'dag-pb' | 'raw'} Argv.inputCodec
 * @property {'dag-cbor' | 'dag-json' | 'dag-pb' | 'raw'} Argv.storeCodec
 * @property {import('multiformats/cid').Version} Argv.cidVersion
 * @property {boolean} Argv.pin
 * @property {string} Argv.hashAlg
 * @property {string} Argv.cidBase
 * @property {boolean} Argv.preload
 * @property {boolean} Argv.onlyHash
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'put [data]',

  describe: 'accepts input from a file or stdin and parses it into an object of the specified format',

  builder: {
    data: {
      string: true
    },
    'store-codec': {
      string: true,
      default: 'dag-cbor',
      describe: 'The codec that the stored object will be encoded with',
      choices: ['dag-cbor', 'dag-json', 'dag-pb', 'raw']
    },
    'input-codec': {
      string: true,
      default: 'dag-json',
      describe: 'The codec that the input object is encoded with',
      choices: ['dag-cbor', 'dag-json', 'dag-pb', 'raw']
    },
    pin: {
      boolean: true,
      default: true,
      describe: 'Pin this object when adding'
    },
    'hash-alg': {
      string: true,
      alias: 'hash',
      default: 'sha2-256',
      describe: 'Hash function to use'
    },
    'cid-version': {
      number: true,
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    preload: {
      boolean: true,
      default: true,
      describe: 'Preload this object when adding'
    },
    'only-hash': {
      boolean: true,
      default: false,
      describe: 'Only hash the content, do not write to the underlying block store'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print, getStdin }, data, inputCodec, storeCodec, pin, hashAlg, cidVersion, cidBase, preload, onlyHash, timeout }) {
    if (!codecs[inputCodec]) {
      throw new Error(`Unknown input-codec ${inputCodec}`)
    }

    if (storeCodec !== 'dag-pb') {
      cidVersion = 1
    }

    /** @type {Uint8Array} */
    let source

    if (!data) {
      // pipe from stdin
      source = (await concat(getStdin(), { type: 'buffer' })).subarray()
    } else {
      source = Buffer.from(data)
    }

    const node = codecs[inputCodec].decode(source)

    const cid = await ipfs.dag.put(node, {
      storeCodec,
      hashAlg,
      version: cidVersion,
      onlyHash,
      preload,
      pin,
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)

    print(cid.toString(base.encoder))
  }
}

export default command
