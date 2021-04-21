'use strict'

const {
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:core:utils:remove-link')
const { UnixFS } = require('ipfs-unixfs')
const {
  generatePath,
  updateHamtDirectory
} = require('./hamt-utils')
const errCode = require('err-code')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash

/**
 * @typedef {import('../').MfsContext} MfsContext
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('hamt-sharding').Bucket<any>} Bucket
 * @typedef {import('ipld-dag-pb').DAGNode} DAGNode
 *
 * @typedef {object} RemoveLinkOptions
 * @property {string} name
 * @property {number} shardSplitThreshold
 * @property {HashName} hashAlg
 * @property {CIDVersion} cidVersion
 * @property {boolean} flush
 * @property {CID} [parentCid]
 * @property {DAGNode} [parent]
 *
 * @typedef {object} RemoveLinkOptionsInternal
 * @property {string} name
 * @property {number} shardSplitThreshold
 * @property {HashName} hashAlg
 * @property {CIDVersion} cidVersion
 * @property {boolean} flush
 * @property {DAGNode} parent
 */

/**
 * @param {MfsContext} context
 * @param {RemoveLinkOptions} options
 */
const removeLink = async (context, options) => {
  let parent = options.parent

  if (options.parentCid) {
    if (!CID.isCID(options.parentCid)) {
      throw errCode(new Error('Invalid CID passed to removeLink'), 'EINVALIDPARENTCID')
    }

    log(`Loading parent node ${options.parentCid}`)
    parent = await context.ipld.get(options.parentCid)
  }

  if (!parent) {
    throw errCode(new Error('No parent node or CID passed to removeLink'), 'EINVALIDPARENT')
  }

  if (!options.name) {
    throw errCode(new Error('No child name passed to removeLink'), 'EINVALIDCHILDNAME')
  }

  const meta = UnixFS.unmarshal(parent.Data)

  if (meta.type === 'hamt-sharded-directory') {
    log(`Removing ${options.name} from sharded directory`)

    return removeFromShardedDirectory(context, {
      ...options,
      parent
    })
  }

  log(`Removing link ${options.name} regular directory`)

  return removeFromDirectory(context, {
    ...options,
    parent
  })
}

/**
 * @param {MfsContext} context
 * @param {RemoveLinkOptionsInternal} options
 */
const removeFromDirectory = async (context, options) => {
  const hashAlg = mh.names[options.hashAlg]

  options.parent.rmLink(options.name)
  const cid = await context.ipld.put(options.parent, mc.DAG_PB, {
    cidVersion: options.cidVersion,
    hashAlg
  })

  log(`Updated regular directory ${cid}`)

  return {
    node: options.parent,
    cid
  }
}

/**
 * @param {MfsContext} context
 * @param {RemoveLinkOptionsInternal} options
 */
const removeFromShardedDirectory = async (context, options) => {
  const {
    rootBucket, path
  } = await generatePath(context, options.name, options.parent)

  await rootBucket.del(options.name)

  const {
    node
  } = await updateShard(context, path, options.name, options)

  return updateHamtDirectory(context, node.Links, rootBucket, options)
}

/**
 * @param {MfsContext} context
 * @param {{ bucket: Bucket, prefix: string, node?: DAGNode }[]} positions
 * @param {string} name
 * @param {RemoveLinkOptionsInternal} options
 * @returns {Promise<{ node: DAGNode, cid: CID, size: number }>}
 */
const updateShard = async (context, positions, name, options) => {
  const last = positions.pop()

  if (!last) {
    throw errCode(new Error('Could not find parent'), 'EINVALIDPARENT')
  }

  const {
    bucket,
    prefix,
    node
  } = last

  if (!node) {
    throw errCode(new Error('Could not find parent'), 'EINVALIDPARENT')
  }

  const link = node.Links
    .find(link => link.Name.substring(0, 2) === prefix)

  if (!link) {
    throw errCode(new Error(`No link found with prefix ${prefix} for file ${name}`), 'ERR_NOT_FOUND')
  }

  if (link.Name === `${prefix}${name}`) {
    log(`Removing existing link ${link.Name}`)

    node.rmLink(link.Name)

    await bucket.del(name)

    return updateHamtDirectory(context, node.Links, bucket, options)
  }

  log(`Descending into sub-shard ${link.Name} for ${prefix}${name}`)

  const result = await updateShard(context, positions, name, options)

  let cid = result.cid
  let size = result.size
  let newName = prefix

  if (result.node.Links.length === 1) {
    log(`Removing subshard for ${prefix}`)

    // convert shard back to normal dir
    const link = result.node.Links[0]

    newName = `${prefix}${link.Name.substring(2)}`
    cid = link.Hash
    size = link.Tsize
  }

  log(`Updating shard ${prefix} with name ${newName}`)

  return updateShardParent(context, bucket, node, prefix, newName, size, cid, options)
}

/**
 * @param {MfsContext} context
 * @param {Bucket} bucket
 * @param {DAGNode} parent
 * @param {string} oldName
 * @param {string} newName
 * @param {number} size
 * @param {CID} cid
 * @param {RemoveLinkOptionsInternal} options
 */
const updateShardParent = (context, bucket, parent, oldName, newName, size, cid, options) => {
  parent.rmLink(oldName)
  parent.addLink(new DAGLink(newName, size, cid))

  return updateHamtDirectory(context, parent.Links, bucket, options)
}

module.exports = removeLink
