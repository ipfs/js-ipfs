'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const toMfsPath = require('./utils/to-mfs-path')
const log = require('debug')('ipfs:mfs:touch')
const errCode = require('err-code')
const { UnixFS } = require('ipfs-unixfs')
const toTrail = require('./utils/to-trail')
const addLink = require('./utils/add-link')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
// @ts-ignore - TODO vmx 2021-03-31
const dagPb = require('@ipld/dag-pb')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')
const { sha256 } = require('multiformats/hashes/sha2')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} flush
 * @property {number} shardSplitThreshold
 * @property {CIDVersion} cidVersion
 * @property {HashName} hashAlg
 * @property {MtimeLike} [mtime]
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  flush: true,
  shardSplitThreshold: 1000,
  cidVersion: 0,
  hashAlg: 'sha2-256'
}

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["touch"]}
   */
  async function mfsTouch (path, options = {}) {
    /** @type {DefaultOptions} */
    const settings = mergeOptions(defaultOptions, options)
    settings.mtime = settings.mtime || new Date()

    log(`Touching ${path} mtime: ${settings.mtime}`)

    const {
      cid,
      mfsDirectory,
      name,
      exists
    } = await toMfsPath(context, path, settings)

    let updatedBlock

    let cidVersion = settings.cidVersion

    if (!exists) {
      const metadata = new UnixFS({
        type: 'file',
        // @ts-ignore TODO: restore hrtime support to ipfs-unixfs constructor - it's in the code, just not the signature
        mtime: settings.mtime
      })
      const node = dagPb.prepare({ Data: metadata.marshal() })
      updatedBlock = await Block.encode({
        value: node,
        codec: dagPb,
        hasher: sha256
      })
      if (settings.flush) {
        await context.blockStorage.put(updatedBlock)
      }
    } else {
      if (cid.code !== dagPb.code) {
        throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
      }

      cidVersion = cid.version

      const block = await context.blockStorage.get(cid)
      const node = dagPb.decode(block.bytes)

      const metadata = UnixFS.unmarshal(node.Data)

      // @ts-ignore TODO: restore setting all date types as mtime - it's in the code, just not the signature
      metadata.mtime = settings.mtime

      const updatedNode = dagPb.prepare({
          Data: metadata.marshal(),
          Links: node.Links
      })

      updatedBlock = await Block.encode({
        value: updatedNode,
        codec: dagPb,
        hasher: sha256
      })
      if (settings.flush) {
        await context.blockStorage.put(updatedBlock)
      }
    }

    const trail = await toTrail(context, mfsDirectory)
    const parent = trail[trail.length - 1]
    // TODO vmx 2021-03-31 check if `toTrail()` should perhaps not return lagacy CIDs
    const parentCid = CID.decode(parent.cid.bytes)
    const parentBlock = await context.blockStorage.get(parentCid)
    const parentNode = dagPb.decode(parentBlock.bytes)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      //cid: asLegacyCid(updatedBlock.cid),
      cid: updatedBlock.cid,
      // TODO vmx 2021-03-31: Check if that's the correct size of whether we should just use no size at all
      size: updatedBlock.bytes.length,
      flush: settings.flush,
      shardSplitThreshold: settings.shardSplitThreshold,
      // TODO vmx 2021-02-23: Check if the hash alg is always hardcoded
      hashAlg: 'sha2-256',
      cidVersion
    })

    // TODO vmx 2021-02-22: If there are errors about the CID version, do the
    // conversion to the correct CID version here, based on `cidVersion`.
    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, settings)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, settings)
  }

  return withTimeoutOption(mfsTouch)
}
