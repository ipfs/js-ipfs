import split from 'it-split'
import { CID } from 'multiformats/cid'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string[]} [Argv.cids]
 * @property {string} [Argv.format]
 * @property {import('multiformats/cid').Version} [Argv.cidVersion]
 * @property {string} [Argv.base]
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'format [cids...]',

  describe: 'Format and convert a CID in various useful ways',

  builder: {
    format: {
      describe: `Printf style format string:

%% literal %
%b multibase name
%B multibase code
%v version string
%V version number
%c codec name
%C codec code
%h multihash name
%H multihash code
%L hash digest length
%m multihash encoded in base %b (with multibase prefix)
%M multihash encoded in base %b without multibase prefix
%d hash digest encoded in base %b (with multibase prefix)
%D hash digest encoded in base %b without multibase prefix
%s cid string encoded in base %b (1)
%S cid string encoded in base %b without multibase prefix
%P cid prefix: %v-%c-%h-%L

(1) For CID version 0 the multibase must be base58btc and no prefix is used. For Cid version 1 the multibase prefix is included.`,
      alias: 'f',
      string: true,
      default: '%s'
    },
    'cid-version': {
      describe: 'CID version to convert to',
      alias: 'v',
      number: true
    },
    base: {
      describe: 'Multibase to display output in',
      alias: 'b',
      string: true
    }
  },

  async handler ({ ctx: { ipfs, print, getStdin }, cids, format, cidVersion, base }) {
    let input

    if (cids && cids.length) {
      input = cids
    } else {
      input = split(getStdin())
    }

    let formatStr = format || '%s'

    if (formatStr === 'prefix') {
      formatStr = '%P'
    }

    if (typeof formatStr !== 'string' || formatStr.indexOf('%') === -1) {
      throw new Error(`invalid format string: ${formatStr}`)
    }

    for await (const data of input) {
      const str = data.toString().trim()

      if (!str) {
        continue
      }

      let cid = CID.parse(str)

      if (cidVersion != null && cid.version !== cidVersion) {
        if (cidVersion === 0) {
          cid = cid.toV0()
        } else if (cidVersion === 1) {
          cid = cid.toV1()
        } else {
          throw new Error(`invalid cid version: ${cidVersion}`)
        }
      }

      let cidBase = findBase(str, ipfs)

      if (base) {
        const foundBase = ipfs.bases.listBases().find(b => b.name === base)

        if (!foundBase) {
          throw new Error(`invalid base prefix: ${str.substring(0, 1)}`)
        }

        cidBase = foundBase
      }

      print(formatStr.replace(/%([a-zA-Z%])/g, replacer(cid, cidBase, ipfs)))
    }
  }
}

export default command

/**
 * @param {CID} cid
 * @param {import('multiformats/bases/interface').MultibaseCodec<any>} base
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @returns {(match: any, specifier: string) => string}
 */
function replacer (cid, base, ipfs) {
  /**
   * @param {*} match
   * @param {string} specifier
   */
  const replace = (match, specifier) => {
    switch (specifier) {
      case '%':
        return '%'
      case 'b': // base name
        return base.name
      case 'B': // base code
        return base.prefix
      case 'v': // version string
        return `cidv${cid.version}`
      case 'V': // version num
        return cid.version.toString()
      case 'c': // codec name
        return findCodec(cid, ipfs).name
      case 'C': // codec code
        return cid.code
      case 'h': // hash fun name
        return findHasher(cid, ipfs).name
      case 'H': // hash fun code
        return findHasher(cid, ipfs).code
      case 'L': // hash length
        return cid.multihash.size.toString()
      case 'm': // multihash encoded in base %b
        return base.encoder.encode(cid.multihash.bytes)
      case 'M': // multihash encoded in base %b without base prefix
        return base.encoder.encode(cid.multihash.bytes).substring(1)
      case 'd': // hash digest encoded in base %b
        return base.encoder.encode(cid.multihash.digest)
      case 'D': // hash digest encoded in base %b without base prefix
        return base.encoder.encode(cid.multihash.digest).substring(1)
      case 's': // cid string encoded in base %b
        return base.encoder.encode(cid.bytes).slice(cid.version === 0 && base.name === 'base58btc' ? 1 : 0)
      case 'S': // cid string without base prefix
        return base.encoder.encode(cid.bytes).slice(1)
      case 'P': // prefix
        return prefix(cid, ipfs)

      default:
        throw new Error(`unrecognized specifier in format string: ${specifier}`)
    }
  }

  return replace
}

/**
 * @param {string} str
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
function findBase (str, ipfs) {
  if (CID.parse(str).version === 0) {
    // force a match for base58btc for CIDv0, assuming it's configured
    str = `z${str}`
  }

  const prefix = str.substring(0, 1)
  const base = ipfs.bases.listBases().find(b => b.prefix === prefix)

  if (!base) {
    throw new Error(`invalid base prefix: ${str.substring(0, 1)}`)
  }

  return base
}

/**
 * @param {CID} cid
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
function findCodec (cid, ipfs) {
  const codec = ipfs.codecs.listCodecs().find(c => c.code === cid.code)

  if (!codec) {
    throw new Error(`invalid codec: ${cid.code}`)
  }

  return codec
}

/**
 * @param {CID} cid
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
function findHasher (cid, ipfs) {
  const codec = ipfs.hashers.listHashers().find(h => h.code === cid.multihash.code)

  if (!codec) {
    throw new Error(`invalid codec: ${cid.code}`)
  }

  return codec
}

/**
 * @param {CID} cid
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
function prefix (cid, ipfs) {
  const hasher = findHasher(cid, ipfs)
  const codec = findCodec(cid, ipfs)

  return `cidv${cid.version}-${codec.name}-${hasher.name}-${cid.multihash.size}`
}
