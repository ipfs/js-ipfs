'use strict'

const errCode = require('err-code')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const toSources = require('./utils/to-sources')
const removeLink = require('./utils/remove-link')
const toMfsPath = require('./utils/to-mfs-path')
const toTrail = require('./utils/to-trail')
const applyDefaultOptions = require('./utils/apply-default-options')
const {
  FILE_SEPARATOR
} = require('./utils/constants')

const defaultOptions = {
  recursive: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  format: 'dag-pb',
  flush: true
}

module.exports = (context) => {
  return async function mfsRm () {
    const args = Array.from(arguments)

    const {
      sources
    } = await toSources(context, args, defaultOptions)
    const options = applyDefaultOptions(args, defaultOptions)

    if (!sources.length) {
      throw errCode(new Error('Please supply at least one path to remove'), 'ERR_INVALID_PARAMS')
    }

    sources.forEach(source => {
      if (source.path === FILE_SEPARATOR) {
        throw errCode(new Error('Cannot delete root'), 'ERR_INVALID_PARAMS')
      }
    })

    for (const source of sources) {
      await removePath(context, source.path, options)
    }
  }
}

const removePath = async (context, path, options) => {
  const mfsPath = await toMfsPath(context, path)
  const trail = await toTrail(context, mfsPath.mfsPath, options)
  const child = trail.pop()
  const parent = trail[trail.length - 1]

  if (!parent) {
    throw errCode(new Error(`${path} does not exist`), 'ERR_NOT_FOUND')
  }

  if (child.type === 'directory' && !options.recursive) {
    throw errCode(new Error(`${path} is a directory, use -r to remove directories`), 'ERR_WAS_DIR')
  }

  const {
    cid
  } = await removeLink(context, {
    parentCid: parent.cid,
    name: child.name,
    format: options.format,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    flush: options.flush
  })

  parent.cid = cid

  // update the tree with the new child
  const newRootCid = await updateTree(context, trail, options)

  // Update the MFS record with the new CID for the root of the tree
  await updateMfsRoot(context, newRootCid)
}
