'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const toMfsPath = require('./utils/to-mfs-path')
const log = require('debug')('ipfs:mfs:touch')
const errCode = require('err-code')
const UnixFS = require('ipfs-unixfs')
const toTrail = require('./utils/to-trail')
const addLink = require('./utils/add-link')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const { DAGNode } = require('ipld-dag-pb')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const defaultOptions = {
  /** @type {ToMTime|undefined} */
  mtime: undefined,
  flush: true,
  shardSplitThreshold: 1000,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  signal: undefined
}

module.exports = (context) => {
  /**
   * Update the mtime of a file or directory
   *
   * @param {string} path - The MFS path to update the mtime for
   * @param {TouchOptions & AbortOptions} [options]
   * @returns {Promise<void>}
   *
   * @example
   * ```js
   * // set the mtime to the current time
   * await ipfs.files.touch('/path/to/file.txt')
   * // set the mtime to a specific time
   * await ipfs.files.touch('/path/to/file.txt', {
   *   mtime: new Date('May 23, 2014 14:45:14 -0700')
   * })
   * ```
   */
  async function mfsTouch (path, options = {}) {
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

/**
 * @typedef {Object} TouchOptions
 * @property {ToMTime} [mtime] - A Date object, an object with `{ secs, nsecs }` properties where secs is the number of seconds since (positive) or before (negative) the Unix Epoch began and nsecs is the number of nanoseconds since the last full second, or the output of `process.hrtime()`
 * @property {boolean} [flush=false] - If true the changes will be immediately flushed to disk
 * @property {string} [hashAlg='sha2-256'] - The hash algorithm to use for any updated entries
 * @property {import('cids').CIDVersion} [cidVersion] - The CID version to use for any updated entries
 *
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/files').ToMTime} ToMTime
 */
