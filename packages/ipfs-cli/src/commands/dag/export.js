'use strict'

const { Readable } = require('stream')
const { default: parseDuration } = require('parse-duration')
const LegacyCID = require('cids')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')
const { base58btc } = require('multiformats/bases/base58')
const { CarWriter } = require('@ipld/car/writer')
/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<number, any>} BlockCodec
 */
/** @type {BlockCodec[]} */
const codecs = [
  require('@ipld/dag-pb'),
  require('@ipld/dag-cbor'),
  require('@ipld/dag-json')
].reduce((/** @type {BlockCodec[]} */ codecs, /** @type {BlockCodec} */ codec) => {
  codecs[codec.code] = codec
  return codecs
}, [])

// blocks that we're OK with not inspecting for links
const NO_LINKS_CODECS = [
  0x51, // CBOR
  0x55, // raw
  0x0200 // JSON
]

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('@ipld/car/api').BlockWriter} BlockWriter
 */

module.exports = {
  command: 'export <root cid>',

  describe: 'Streams the DAG beginning at the given root CID as a .car stream on stdout.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.rootcid
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, rootcid, timeout }) {
    const options = { timeout }
    const cid = CID.parse(rootcid)

    const { writer, out } = await CarWriter.create([cid])
    Readable.from(out).pipe(process.stdout)

    await traverseWrite(ipfs, options, cid, writer)
    writer.close()
  }
}

/**
 * @param {IPFS} ipfs
 * @param {{ timeout?: number}} options
 * @param {CID} cid
 * @returns {Promise<{cid:CID, bytes:Uint8Array, links:CID[]}>}
 */
const getBlock = async (ipfs, options, cid) => {
  const result = await ipfs.block.get(new LegacyCID(cid.bytes), options)
  if (!result) {
    throw new Error(`Failed to fetch block ${cid}`)
  }
  const resultCid = CID.asCID(result.cid)
  if (!resultCid || !resultCid.equals(cid)) {
    // shouldn't happen, but let's sanity check
    throw new Error(`Fetched CID ${result.cid} does not match requested ${cid}`)
  }
  const bytes = result.data
  /** @type {CID[]} */
  let links = []
  const codec = codecs[result.cid.code]
  if (codec) {
    const block = Block.createUnsafe({ bytes: result.data, cid, codec })
    links = [...block.links()].map((l) => l[1])
  } else if (!NO_LINKS_CODECS.includes(result.cid.code)) {
    throw new Error(`Can't decode links in block with codec 0x${result.cid.code.toString(16)} to form complete DAG`)
  }
  return { cid, bytes, links }
}

/**
 * @param {IPFS} ipfs
 * @param {{ timeout?: number}} options
 * @param {CID} cid
 * @param {BlockWriter} writer
 * @param {Set<string>} seen
 * @returns {Promise<void>}
 */
async function traverseWrite (ipfs, options, cid, writer, seen = new Set()) {
  const b58Cid = cid.toString(base58btc)
  if (seen.has(b58Cid)) {
    return
  }
  const block = await getBlock(ipfs, options, cid)
  await writer.put(block)
  seen.add(b58Cid)

  // recursive traversal of all links
  for (const link of block.links) {
    await traverseWrite(ipfs, options, link, writer, seen)
  }
}
