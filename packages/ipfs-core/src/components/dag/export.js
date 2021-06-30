'use strict'

const LegacyCID = require('cids')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')
const { base58btc } = require('multiformats/bases/base58')
const { CarWriter } = require('@ipld/car/writer')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

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
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('@ipld/car/api').BlockWriter} BlockWriter
 */

/**
 * @param {Object} config
 * @param {BlockService} config.blockService
 * @param {Preload} config.preload
 */
module.exports = ({ blockService, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["export"]}
   */
  async function * dagExport (root, options = {}) {
    if (options.preload !== false) {
      preload(root)
    }

    const cid = CID.asCID(root)
    if (!cid) {
      throw new Error(`Unexpected error converting CID type: ${root}`)
    }

    const { writer, out } = await CarWriter.create([cid])

    // we need to write with one async channel and send the CarWriter output
    // with another to the caller, but if the write causes an error we capture
    // that and make sure it gets propagated
    /** @type {Error|null} */
    let err = null
    ;(async () => {
      try {
        await traverseWrite(blockService, cid, writer)
        writer.close()
      } catch (e) {
        err = e
      }
    })()

    for await (const chunk of out) {
      if (err) {
        break
      }
      yield chunk
    }
    if (err) {
      throw err
    }
  }

  return withTimeoutOption(dagExport)
}

/**
 * @param {BlockService} blockService
 * @param {CID} cid
 * @param {BlockWriter} writer
 * @param {Set<string>} seen
 * @returns {Promise<void>}
 */
async function traverseWrite (blockService, cid, writer, seen = new Set()) {
  const b58Cid = cid.toString(base58btc)
  if (seen.has(b58Cid)) {
    return
  }
  const block = await getBlock(blockService, cid)
  await writer.put(block)
  seen.add(b58Cid)

  // recursive traversal of all links
  for (const link of block.links) {
    await traverseWrite(blockService, link, writer, seen)
  }
}

/**
 * @param {BlockService} blockService
 * @param {CID} cid
 * @returns {Promise<{cid:CID, bytes:Uint8Array, links:CID[]}>}
 */
async function getBlock (blockService, cid) {
  const block = await blockService.get(new LegacyCID(cid.bytes))
  if (!block) { // TODO: is this possible? or does BlockService.get throw?
    throw new Error(`Failed to fetch block ${cid}`)
  }
  const resultCid = CID.asCID(block.cid)
  if (!resultCid || !resultCid.equals(cid)) {
    // shouldn't happen, but let's sanity check
    throw new Error(`Fetched CID ${block.cid} does not match requested ${cid}`)
  }
  const bytes = block.data
  /** @type {CID[]} */
  let links = []
  const codec = codecs[block.cid.code]
  if (codec) {
    const block = Block.createUnsafe({ bytes, cid, codec })
    links = [...block.links()].map((l) => l[1])
  } else if (!NO_LINKS_CODECS.includes(cid.code)) {
    throw new Error(`Can't decode links in block with codec 0x${cid.code.toString(16)} to form complete DAG`)
  }
  return { cid, bytes, links }
}
