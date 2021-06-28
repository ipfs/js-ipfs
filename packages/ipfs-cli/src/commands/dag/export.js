'use strict'

const { Readable } = require('stream')
const { default: parseDuration } = require('parse-duration')
const LegacyCID = require('cids')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')
const { base58 } = require('multiformats/bases/base58')
const { CarWriter } = require('@ipld/car/writer')
const codecs = [
  require('@ipld/dag-pb'),
  require('@ipld/dag-cbor'),
  require('@ipld/dag-json')
].reduce((codecs, codec) => {
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

    const complete = await traverseWrite(ipfs, options, cid, writer)
    writer.close()

    if (!complete) {
      print('cannot decode links in all blocks, DAG may be incomplete')
    }
  }
}

/**
 * @param {IPFS} ipfs
 * @param {{ timeout?: number}} options
 * @param {CID} cid
 * @returns {Promise<{cid:CID, bytes:Uint8Array, links:CID[]|null}>}
 */
const getBlock = async (ipfs, options, cid) => {
  cid = CID.asCID(cid)
  const result = await ipfs.block.get(new LegacyCID(cid.bytes), options)
  const bytes = result.data
  let links = null
  const codec = codecs[result.cid.code]
  if (codec) {
    const block = Block.createUnsafe({ bytes: result.data, cid: CID.asCID(result.cid), codec })
    links = [...block.links()].map((l) => l[1])
  } else if (NO_LINKS_CODECS.includes(result.cid.code)) {
    // these blocks are known not to contain any IPLD links
    links = []
  } // else we may have a block with links that we can't decode
  return { cid, bytes, links }
}

/**
 * @param {IPFS} ipfs
 * @param {{ timeout?: number}} options
 * @param {CID} cid
 * @param {BlockWriter} writer
 * @param {Set<string>} seen
 * @returns {boolean} complete DAG
 */
async function traverseWrite (ipfs, options, cid, writer, seen = new Set()) {
  const b58Cid = cid.toString(base58)
  if (seen.has(b58Cid)) {
    return true
  }
  const block = await getBlock(ipfs, options, cid)
  await writer.put(block)
  seen.add(b58Cid)
  if (block.links === null) {
    return false // potentially incomplete DAG
  }

  // recursive traversal of all links
  let complete = true
  for (const link of block.links) {
    if (!await traverseWrite(ipfs, options, link, writer, seen)) {
      complete = false
    }
  }
  return complete
}
