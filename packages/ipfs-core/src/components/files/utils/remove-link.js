'use strict'

// @ts-ignore - TODO vmx 2021-03-31
const dagPb = require('@ipld/dag-pb')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')
const Block = require('multiformats/block')
const log = require('debug')('ipfs:mfs:core:utils:remove-link')
const { UnixFS } = require('ipfs-unixfs')
const {
  generatePath,
  updateHamtDirectory
} = require('./hamt-utils')
const errCode = require('err-code')

/**
 * @typedef {import('../').MfsContext} MfsContext
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('hamt-sharding').Bucket<any>} Bucket
 * @typedef {import('../../../types').PbNode} PbNode
 *
 * @typedef {object} RemoveLinkOptions
 * @property {string} name
 * @property {number} shardSplitThreshold
 * @property {HashName} hashAlg
 * @property {CIDVersion} cidVersion
 * @property {boolean} flush
 * @property {CID} [parentCid]
 * @property {PbNode} [parent]
 *
 * @typedef {object} RemoveLinkOptionsInternal
 * @property {string} name
 * @property {number} shardSplitThreshold
 * @property {HashName} hashAlg
 * @property {CIDVersion} cidVersion
 * @property {boolean} flush
 * @property {PbNode} parent
 */

/**
 * @param {MfsContext} context
 * @param {RemoveLinkOptions} options
 */
const removeLink = async (context, options) => {
  let parent = options.parent

  if (options.parentCid) {
    const parentCid = CID.asCID(options.parentCid)
    if (parentCid === null) {
      throw errCode(new Error('Invalid CID passed to removeLink'), 'EINVALIDPARENTCID')
    }

    log(`Loading parent node ${parentCid}`)
    const block = await context.blockStorage.get(parentCid)
    parent = dagPb.decode(block.bytes)
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
  // Remove existing link if it exists
  options.parent.Links = options.parent.Links.filter((link) => {
    link.Name !== options.name
  })

  let hasher
  switch (options.hashAlg) {
    case 'sha2-256':
      hasher = sha256
      break
    default:
      throw new Error('TODO vmx 2021-03-31: support hashers that are not sha2-256')
  }

  // TODO vmx 2021-03-04: Check if the CID version matters
  const parentBlock = await Block.encode({
    value: options.parent,
    codec: dagPb,
    hasher
  })
  await context.blockStorage.put(parentBlock)

  const cid = parentBlock.cid
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
 * @param {{ bucket: Bucket, prefix: string, node?: PbNode }[]} positions
 * @param {string} name
 * @param {RemoveLinkOptionsInternal} options
 * @returns {Promise<{ node: PbNode, cid: CID, size: number }>}
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

    const links = node.Links.filter((nodeLink) => {
      return nodeLink.Name !== link.Name
    })

    await bucket.del(name)

    return updateHamtDirectory(context, links, bucket, options)
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
 * @param {PbNode} parent
 * @param {string} oldName
 * @param {string} newName
 * @param {number} size
 * @param {CID} cid
 * @param {RemoveLinkOptionsInternal} options
 */
const updateShardParent = (context, bucket, parent, oldName, newName, size, cid, options) => {
  // Remove existing link if it exists
  const parentLinks = parent.Links.filter((link) => {
    link.Name !== oldName
  })
  parentLinks.push({
    Name: newName,
    Tsize: size,
    Hash: cid
  })

  return updateHamtDirectory(context, parentLinks, bucket, options)
}

module.exports = removeLink
