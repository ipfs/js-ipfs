'use strict'

const mkdir = require('./mkdir')
const stat = require('./stat')
const log = require('debug')('ipfs:mfs:cp')
const errCode = require('err-code')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const addLink = require('./utils/add-link')
const toMfsPath = require('./utils/to-mfs-path')
const toSourcesAndDestination = require('./utils/to-sources-and-destination')
const toTrail = require('./utils/to-trail')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const defaultOptions = {
  parents: false,
  flush: true,
  hashAlg: 'sha2-256',
  cidVersion: 0,
  shardSplitThreshold: 1000,
  signal: undefined
}

/**
 * @param {any} context
 */
module.exports = function derp (context) {
  /**
   * @param {[...from:From, options?:CpOptions]} args
   * @returns {Promise<void>}
   */
  async function mfsCp (...args) {
    let {
      sources,
      destination,
      options
    } = await toSourcesAndDestination(context, args, defaultOptions)

    if (!sources.length) {
      throw errCode(new Error('Please supply at least one source'), 'ERR_INVALID_PARAMS')
    }

    options.parents = options.p || options.parents

    // make sure all sources exist
    const missing = sources.find(source => !source.exists)

    if (missing) {
      throw errCode(new Error(`${missing.path} does not exist`), 'ERR_INVALID_PARAMS')
    }

    const destinationIsDirectory = isDirectory(destination)

    if (destination.exists) {
      log('Destination exists')

      if (sources.length === 1 && !destinationIsDirectory) {
        throw errCode(new Error('directory already has entry by that name'), 'ERR_ALREADY_EXISTS')
      }
    } else {
      log('Destination does not exist')

      if (sources.length > 1) {
        // copying multiple files to one location, destination will be a directory
        if (!options.parents) {
          throw errCode(new Error('destination did not exist, pass -p to create intermediate directories'), 'ERR_INVALID_PARAMS')
        }

        await mkdir(context)(destination.path, options)
        destination = await toMfsPath(context, destination.path, options)
      } else if (destination.parts.length > 1) {
        // copying to a folder, create it if necessary
        const parentFolder = `/${destination.parts.slice(0, -1).join('/')}`

        try {
          await stat(context)(parentFolder, options)
        } catch (err) {
          if (err.code !== 'ERR_NOT_FOUND') {
            throw err
          }

          if (!options.parents) {
            throw errCode(new Error('destination did not exist, pass -p to create intermediate directories'), 'ERR_INVALID_PARAMS')
          }

          await mkdir(context)(parentFolder, options)
          destination = await toMfsPath(context, destination.path, options)
        }
      }
    }

    const destinationPath = isDirectory(destination) ? destination.mfsPath : destination.mfsDirectory
    const trail = await toTrail(context, destinationPath)

    if (sources.length === 1) {
      const source = sources.pop()
      const destinationName = destinationIsDirectory ? source.name : destination.name

      log(`Only one source, copying to destination ${destinationIsDirectory ? 'directory' : 'file'} ${destinationName}`)

      return copyToFile(context, source, destinationName, trail, options)
    }

    log('Multiple sources, wrapping in a directory')
    return copyToDirectory(context, sources, destination, trail, options)
  }

  return withTimeoutOption(mfsCp)
}

const isDirectory = (destination) => {
  return destination.unixfs &&
    destination.unixfs.type &&
    destination.unixfs.type.includes('directory')
}

const copyToFile = async (context, source, destination, destinationTrail, options) => {
  let parent = destinationTrail.pop()

  parent = await addSourceToParent(context, source, destination, parent, options)

  // update the tree with the new containing directory
  destinationTrail.push(parent)

  const newRootCid = await updateTree(context, destinationTrail, options)

  // Update the MFS record with the new CID for the root of the tree
  await updateMfsRoot(context, newRootCid, options)
}

const copyToDirectory = async (context, sources, destination, destinationTrail, options) => {
  // copy all the sources to the destination
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]

    destination = await addSourceToParent(context, source, source.name, destination, options)
  }

  // update the tree with the new containing directory
  destinationTrail[destinationTrail.length - 1] = destination

  const newRootCid = await updateTree(context, destinationTrail, options)

  // Update the MFS record with the new CID for the root of the tree
  await updateMfsRoot(context, newRootCid, options)
}

const addSourceToParent = async (context, source, childName, parent, options) => {
  const sourceBlock = await context.repo.blocks.get(source.cid)

  const {
    node,
    cid
  } = await addLink(context, {
    parentCid: parent.cid,
    size: sourceBlock.data.length,
    cid: source.cid,
    name: childName,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    flush: options.flush
  })

  parent.node = node
  parent.cid = cid
  parent.size = node.size

  return parent
}

/**
 * @typedef {Object} CpOptions
 * @property {boolean} [flush=false]
 * @property {number} [shardSplitThreshold=1000]
 * @property {string} [hashAlg=sha2-256]
 * @property {0|1} [cidVersion=0]
 * @property {boolean} [parents=false]
 *
 * @typedef {import('./utils/types').Tuple<CID|string>} From
 *
 * @typedef {import('..').CID} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */
