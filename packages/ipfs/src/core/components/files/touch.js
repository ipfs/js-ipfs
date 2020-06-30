'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
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
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  mtime: undefined,
  flush: true,
  shardSplitThreshold: 1000,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  signal: undefined
}

module.exports = (context) => {
  return withTimeoutOption(async function mfsTouch (path, options) {
    options = options || {}
    options = applyDefaultOptions(options, defaultOptions)
    options.mtime = options.mtime || new Date()

    log(`Touching ${path} mtime: ${options.mtime}`)

    const {
      cid,
      mfsDirectory,
      name,
      exists
    } = await toMfsPath(context, path, options)

    let node
    let updatedCid

    let cidVersion = options.cidVersion

    if (!exists) {
      const metadata = new UnixFS({
        type: 'file',
        mtime: options.mtime
      })
      node = new DAGNode(metadata.marshal())
      updatedCid = await context.ipld.put(node, mc.DAG_PB, {
        cidVersion: options.cidVersion,
        hashAlg: mh.names['sha2-256'],
        onlyHash: !options.flush
      })
    } else {
      if (cid.codec !== 'dag-pb') {
        throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
      }

      cidVersion = cid.version

      node = await context.ipld.get(cid)

      const metadata = UnixFS.unmarshal(node.Data)
      metadata.mtime = options.mtime

      node = new DAGNode(metadata.marshal(), node.Links)

      updatedCid = await context.ipld.put(node, mc.DAG_PB, {
        cidVersion: cid.version,
        hashAlg: mh.names['sha2-256'],
        onlyHash: !options.flush
      })
    }

    const trail = await toTrail(context, mfsDirectory, options)
    const parent = trail[trail.length - 1]
    const parentNode = await context.ipld.get(parent.cid)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      cid: updatedCid,
      size: node.serialize().length,
      flush: options.flush,
      shardSplitThreshold: options.shardSplitThreshold,
      hashAlg: 'sha2-256',
      cidVersion
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, options)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, options)
  })
}
