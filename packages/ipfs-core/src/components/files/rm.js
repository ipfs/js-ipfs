'use strict'

const errCode = require('err-code')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const toSources = require('./utils/to-sources')
const removeLink = require('./utils/remove-link')
const toMfsPath = require('./utils/to-mfs-path')
const toTrail = require('./utils/to-trail')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const defaultOptions = {
  recursive: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  flush: true,
  signal: undefined
}

/**
 * @param {any} context
 */
module.exports = (context) => {
  /**
   * Remove a file or directory
   *
   * @param  {[...paths: Paths, options?:RmOptions]} args
   * @returns {Promise<void>}
   */
  async function mfsRm (...args) {
    const {
      sources,
      options
    } = await toSources(context, args, defaultOptions)

    if (!sources.length) {
      throw errCode(new Error('Please supply at least one path to remove'), 'ERR_INVALID_PARAMS')
    }

    sources.forEach(source => {
      if (source.path === '/') {
        throw errCode(new Error('Cannot delete root'), 'ERR_INVALID_PARAMS')
      }
    })

    for (const source of sources) {
      await removePath(context, source.path, options)
    }
  }

  return withTimeoutOption(mfsRm)
}

const removePath = async (context, path, options) => {
  const mfsPath = await toMfsPath(context, path, options)
  const trail = await toTrail(context, mfsPath.mfsPath)
  const child = trail[trail.length - 1]
  trail.pop()
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
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    flush: options.flush
  })

  parent.cid = cid

  // update the tree with the new child
  const newRootCid = await updateTree(context, trail, options)

  // Update the MFS record with the new CID for the root of the tree
  await updateMfsRoot(context, newRootCid, options)
}

/**
 * @typedef {Object} RmOptions
 * @property {boolean} [recursive=false] - If true all paths under the specifed path(s) will be removed
 * @property {boolean} [flush=false] - If true the changes will be immediately flushed to disk
 * @property {string} [hashAlg='sha2-256'] - The hash algorithm to use for any updated entries
 * @property {0|1} [cidVersion] - The CID version to use for any updated entries
 *
 * @typedef {import('..').CID} CID
 * @typedef {import('./utils/types').Tuple<string>} Paths
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */
