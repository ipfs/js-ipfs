'use strict'

const mh = require('multihashing-async').multihash
const multibase = require('multibase')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const concat = require('it-concat')
const CID = require('cids')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')

/**
 * @typedef {'dag-cbor' | 'dag-pb' | 'raw'} SupportedFormat
 */

/**
 * @type {Record<string, (buf: Buffer) => any>}
 */
const inputDecoders = {
  json: (buf) => JSON.parse(buf.toString()),
  cbor: (buf) => dagCBOR.util.deserialize(buf),
  protobuf: (buf) => dagPB.util.deserialize(buf),
  raw: (buf) => buf
}

/**
 * @type {Record<string, SupportedFormat>}
 */
const formats = {
  cbor: 'dag-cbor',
  raw: 'raw',
  protobuf: 'dag-pb',
  'dag-cbor': 'dag-cbor',
  'dag-pb': 'dag-pb'
}

module.exports = {
  command: 'put [data]',

  describe: 'accepts input from a file or stdin and parses it into an object of the specified format',

  builder: {
    data: {
      type: 'string'
    },
    format: {
      type: 'string',
      alias: 'f',
      default: 'cbor',
      describe: 'Format that the object will be added as',
      choices: ['dag-cbor', 'dag-pb', 'raw', 'cbor', 'protobuf']
    },
    'input-encoding': {
      type: 'string',
      alias: 'input-enc',
      default: 'json',
      describe: 'Format that the input object will be',
      choices: ['json', 'cbor', 'raw', 'protobuf']
    },
    pin: {
      type: 'boolean',
      default: true,
      describe: 'Pin this object when adding'
    },
    'hash-alg': {
      type: 'string',
      alias: 'hash',
      default: 'sha2-256',
      describe: 'Hash function to use',
      choices: Object.keys(mh.names)
    },
    'cid-version': {
      type: 'integer',
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    preload: {
      type: 'boolean',
      default: true,
      describe: 'Preload this object when adding'
    },
    'only-hash': {
      type: 'boolean',
      default: false,
      describe: 'Only hash the content, do not write to the underlying block store'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.data
   * @param {'dag-cbor' | 'dag-pb' | 'raw' | 'cbor' | 'protobuf'} argv.format
   * @param {'json' | 'cbor' | 'raw' | 'protobuf'} argv.inputEncoding
   * @param {import('cids').CIDVersion} argv.cidVersion
   * @param {boolean} argv.pin
   * @param {import('multihashes').HashName} argv.hashAlg
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {boolean} argv.preload
   * @param {boolean} argv.onlyHash
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print, getStdin }, data, format, inputEncoding, pin, hashAlg, cidVersion, cidBase, preload, onlyHash, timeout }) {
    if (inputEncoding === 'cbor') {
      format = 'dag-cbor'
    } else if (inputEncoding === 'protobuf') {
      format = 'dag-pb'
    }

    format = formats[format]

    if (format !== 'dag-pb') {
      cidVersion = 1
    }

    /** @type {Buffer} */
    let source

    if (!data) {
      // pipe from stdin
      source = (await concat(getStdin(), { type: 'buffer' })).slice()
    } else {
      source = Buffer.from(data)
    }

    source = inputDecoders[inputEncoding](source)

    // Support legacy { "/" : "<CID>" } format so dag put is actually useful
    // on the command line: https://github.com/ipld/js-ipld-dag-cbor/issues/84
    if (inputEncoding === 'json' && format === 'dag-cbor') {
      source = objectSlashToCID(source)
    }

    const cid = await ipfs.dag.put(source, {
      format,
      hashAlg,
      version: cidVersion,
      onlyHash,
      preload,
      pin,
      timeout
    })

    print(cidToString(cid, { base: cidBase }))
  }
}

/**
 * @param {any} obj
 * @returns {any}
 */
function objectSlashToCID (obj) {
  if (Array.isArray(obj)) {
    return obj.map(objectSlashToCID)
  }

  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 1 && '/' in obj) {
      if (typeof obj['/'] !== 'string') {
        throw new Error('link should have been a string')
      }
      return new CID(obj['/']) // throws if not a CID - consistent with go-ipfs
    }

    return keys.reduce((obj, key) => {
      obj[key] = objectSlashToCID(obj[key])
      return obj
    }, obj)
  }

  return obj
}
