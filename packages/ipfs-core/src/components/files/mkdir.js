'use strict'

const errCode = require('err-code')
const log = require('debug')('ipfs:mfs:mkdir')
const { exporter } = require('ipfs-unixfs-exporter')
const createNode = require('./utils/create-node')
const toPathComponents = require('./utils/to-path-components')
const updateMfsRoot = require('./utils/update-mfs-root')
const updateTree = require('./utils/update-tree')
const addLink = require('./utils/add-link')
const withMfsRoot = require('./utils/with-mfs-root')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('ipld-dag-pb').DAGNode} DAGNode
 * @typedef {import('ipld-dag-pb').DAGLink} DAGLink
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids')} CID
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} parents
 * @property {HashName} hashAlg
 * @property {CIDVersion} cidVersion
 * @property {number} shardSplitThreshold
 * @property {boolean} flush
 * @property {number} [mode]
 * @property {MtimeLike} [mtime]
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  parents: false,
  hashAlg: 'sha2-256',
  cidVersion: 0,
  shardSplitThreshold: 1000,
  flush: true
}

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["mkdir"]}
   */
  async function mfsMkdir (path, options = {}) {
    /** @type {DefaultOptions} */
    const opts = mergeOptions(defaultOptions, options)

    if (!path) {
      throw new Error('no path given to Mkdir')
    }

    path = path.trim()

    if (path === '/') {
      if (opts.parents) {
        return
      }

      throw errCode(new Error('cannot create directory \'/\': Already exists'), 'ERR_INVALID_PATH')
    }

    if (path.substring(0, 1) !== '/') {
      throw errCode(new Error('paths must start with a leading slash'), 'ERR_INVALID_PATH')
    }

    log(`Creating ${path}`)

    const pathComponents = toPathComponents(path)

    if (pathComponents[0] === 'ipfs') {
      throw errCode(new Error("path cannot have the prefix 'ipfs'"), 'ERR_INVALID_PATH')
    }

    const root = await withMfsRoot(context, opts)
    let parent
    const trail = []
    const emptyDir = await createNode(context, 'directory', opts)

    // make sure the containing folder exists, creating it if necessary
    for (let i = 0; i <= pathComponents.length; i++) {
      const subPathComponents = pathComponents.slice(0, i)
      const subPath = `/ipfs/${root}/${subPathComponents.join('/')}`

      try {
        parent = await exporter(subPath, context.ipld)

        if (parent.type !== 'file' && parent.type !== 'directory') {
          throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
        }

        if (i === pathComponents.length) {
          if (opts.parents) {
            return
          }

          throw errCode(new Error('file already exists'), 'ERR_ALREADY_EXISTS')
        }

        trail.push({
          name: parent.name,
          cid: parent.cid
        })
      } catch (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          if (i < pathComponents.length && !opts.parents) {
            throw errCode(new Error(`Intermediate directory path ${subPath} does not exist, use the -p flag to create it`), 'ERR_NOT_FOUND')
          }

          // add the intermediate directory
          await addEmptyDir(context, subPathComponents[subPathComponents.length - 1], emptyDir, trail[trail.length - 1], trail, opts)
        } else {
          throw err
        }
      }
    }

    // add an empty dir to the last path component
    // await addEmptyDir(context, pathComponents[pathComponents.length - 1], emptyDir, parent, trail)

    // update the tree from the leaf to the root
    const newRootCid = await updateTree(context, trail, opts)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, opts)
  }

  return withTimeoutOption(mfsMkdir)
}

/**
 * @param {MfsContext} context
 * @param {string} childName
 * @param {{ cid: CID, node: { size: number }}} emptyDir
 * @param {{ cid?: CID, node?: DAGNode }} parent
 * @param {{ name: string, cid: CID }[]} trail
 * @param {DefaultOptions} options
 */
const addEmptyDir = async (context, childName, emptyDir, parent, trail, options) => {
  log(`Adding empty dir called ${childName} to ${parent.cid}`)

  const result = await addLink(context, {
    parent: parent.node,
    parentCid: parent.cid,
    size: emptyDir.node.size,
    cid: emptyDir.cid,
    name: childName,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    flush: options.flush,
    shardSplitThreshold: options.shardSplitThreshold
  })

  trail[trail.length - 1].cid = result.cid

  trail.push({
    name: childName,
    cid: emptyDir.cid
  })
}
