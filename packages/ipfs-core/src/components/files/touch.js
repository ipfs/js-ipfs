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
const { DAGNode } = require('ipld-dag-pb')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash
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

    let node
    let updatedCid

    let cidVersion = settings.cidVersion

    if (!exists) {
      const metadata = new UnixFS({
        type: 'file',
        // @ts-ignore TODO: restore hrtime support to ipfs-unixfs constructor - it's in the code, just not the signature
        mtime: settings.mtime
      })
      node = new DAGNode(metadata.marshal())
      updatedCid = await context.ipld.put(node, mc.DAG_PB, {
        cidVersion: settings.cidVersion,
        hashAlg: mh.names['sha2-256'],
        onlyHash: !settings.flush
      })
    } else {
      if (cid.codec !== 'dag-pb') {
        throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
      }

      cidVersion = cid.version

      node = await context.ipld.get(cid)

      const metadata = UnixFS.unmarshal(node.Data)

      // @ts-ignore TODO: restore setting all date types as mtime - it's in the code, just not the signature
      metadata.mtime = settings.mtime

      node = new DAGNode(metadata.marshal(), node.Links)

      updatedCid = await context.ipld.put(node, mc.DAG_PB, {
        cidVersion: cid.version,
        hashAlg: mh.names['sha2-256'],
        onlyHash: !settings.flush
      })
    }

    const trail = await toTrail(context, mfsDirectory)
    const parent = trail[trail.length - 1]
    const parentNode = await context.ipld.get(parent.cid)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      cid: updatedCid,
      size: node.serialize().length,
      flush: settings.flush,
      shardSplitThreshold: settings.shardSplitThreshold,
      hashAlg: 'sha2-256',
      cidVersion
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, settings)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, settings)
  }

  return withTimeoutOption(mfsTouch)
}
