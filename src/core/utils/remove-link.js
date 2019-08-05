'use strict'

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:core:utils:remove-link')
const UnixFS = require('ipfs-unixfs')
const {
  generatePath,
  updateHamtDirectory
} = require('./hamt-utils')
const errCode = require('err-code')
const mc = require('multicodec')
const mh = require('multihashes')

const removeLink = async (context, options) => {
  if (!options.parentCid && !options.parent) {
    throw errCode(new Error('No parent node or CID passed to removeLink'), 'EINVALIDPARENT')
  }

  if (options.parentCid && !CID.isCID(options.parentCid)) {
    throw errCode(new Error('Invalid CID passed to removeLink'), 'EINVALIDPARENTCID')
  }

  if (!options.parent) {
    log(`Loading parent node ${options.parentCid}`)

    options.parent = await context.ipld.get(options.parentCid)
  }

  if (!options.name) {
    throw errCode(new Error('No child name passed to removeLink'), 'EINVALIDCHILDNAME')
  }

  const meta = UnixFS.unmarshal(options.parent.Data)

  if (meta.type === 'hamt-sharded-directory') {
    log(`Removing ${options.name} from sharded directory`)

    return removeFromShardedDirectory(context, options)
  }

  log(`Removing link ${options.name} regular directory`)

  return removeFromDirectory(context, options)
}

const removeFromDirectory = async (context, options) => {
  const format = mc[options.format.toUpperCase().replace(/-/g, '_')]
  const hashAlg = mh.names[options.hashAlg]

  options.parent.rmLink(options.name)
  const cid = await context.ipld.put(options.parent, format, {
    cidVersion: options.cidVersion,
    hashAlg
  })

  log(`Updated regular directory ${cid}`)

  return {
    node: options.parent,
    cid
  }
}

const removeFromShardedDirectory = async (context, options) => {
  const {
    rootBucket, path
  } = await generatePath(context, options.name, options.parent)

  await rootBucket.del(options.name)

  const {
    node
  } = await updateShard(context, path, {
    name: options.name,
    cid: options.cid,
    size: options.size,
    hashAlg: options.hashAlg,
    format: options.format,
    cidVersion: options.cidVersion,
    flush: options.flush
  }, options)

  return updateHamtDirectory(context, node.Links, rootBucket, options)
}

const updateShard = async (context, positions, child, options) => {
  const {
    bucket,
    prefix,
    node
  } = positions.pop()

  const link = node.Links
    .find(link => link.Name.substring(0, 2) === prefix)

  if (!link) {
    throw errCode(new Error(`No link found with prefix ${prefix} for file ${child.name}`), 'ERR_NOT_FOUND')
  }

  if (link.Name === `${prefix}${child.name}`) {
    log(`Removing existing link ${link.Name}`)

    node.rmLink(link.Name)

    await bucket.del(child.name)

    return updateHamtDirectory(context, node.Links, bucket, options)
  }

  log(`Descending into sub-shard ${link.Name} for ${prefix}${child.name}`)

  const result = await updateShard(context, positions, child, options)

  let newName = prefix

  if (result.node.Links.length === 1) {
    log(`Removing subshard for ${prefix}`)

    // convert shard back to normal dir
    result.cid = result.node.Links[0].Hash
    result.node = result.node.Links[0]

    newName = `${prefix}${result.node.Name.substring(2)}`
  }

  log(`Updating shard ${prefix} with name ${newName}`)

  const size = DAGNode.isDAGNode(result.node) ? result.node.size : result.node.Tsize

  return updateShardParent(context, bucket, node, prefix, newName, size, result.cid, options)
}

const updateShardParent = (context, bucket, parent, oldName, newName, size, cid, options) => {
  parent.rmLink(oldName)
  parent.addLink(new DAGLink(newName, size, cid))

  return updateHamtDirectory(context, parent.Links, bucket, options)
}

module.exports = removeLink
