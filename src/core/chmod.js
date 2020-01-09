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
const mh = require('multihashes')

const defaultOptions = {
  flush: true,
  shardSplitThreshold: 1000,
  format: 'dag-pb',
  hashAlg: 'sha2-256',
  cidVersion: 0,
  recursive: false
}

function calculateModification (mode) {
  let modification = 0

  if (mode.includes('x')) {
    modification += 1
  }

  if (mode.includes('w')) {
    modification += 2
  }

  if (mode.includes('r')) {
    modification += 4
  }

  return modification
}

function calculateUGO (references, modification) {
  let ugo = 0

  if (references.includes('u')) {
    ugo += (modification << 6)
  }

  if (references.includes('g')) {
    ugo += (modification << 3)
  }

  if (references.includes('o')) {
    ugo += (modification)
  }

  return ugo
}

function calculateSpecial (references, mode, modification) {
  if (mode.includes('t')) {
    modification += parseInt('1000', 8)
  }

  if (mode.includes('s')) {
    if (references.includes('u')) {
      modification += parseInt('4000', 8)
    }

    if (references.includes('g')) {
      modification += parseInt('2000', 8)
    }
  }

  return modification
}

// https://en.wikipedia.org/wiki/Chmod#Symbolic_modes
function parseSymbolicMode (input, originalMode) {
  if (!originalMode) {
    originalMode = 0
  }

  const match = input.match(/^(u?g?o?a?)(-?\+?=?)?(r?w?x?X?s?t?)$/)

  if (!match) {
    throw new Error(`Invalid file mode: ${input}`)
  }

  let [
    _, // eslint-disable-line no-unused-vars
    references,
    operator,
    mode
  ] = match

  if (references === 'a' || !references) {
    references = 'ugo'
  }

  let modification = calculateModification(mode)
  modification = calculateUGO(references, modification)
  modification = calculateSpecial(references, mode, modification)

  if (operator === '=') {
    if (references.includes('u')) {
      // blank u bits
      originalMode = originalMode & parseInt('7077', 8)

      // or them together
      originalMode = originalMode | modification
    }

    if (references.includes('g')) {
      // blank g bits
      originalMode = originalMode & parseInt('7707', 8)

      // or them together
      originalMode = originalMode | modification
    }

    if (references.includes('o')) {
      // blank o bits
      originalMode = originalMode & parseInt('7770', 8)

      // or them together
      originalMode = originalMode | modification
    }

    return originalMode
  }

  if (operator === '+') {
    return modification | originalMode
  }

  if (operator === '-') {
    return modification ^ originalMode
  }
}

module.exports = (context) => {
  return async function mfsChmod (path, mode, options) {
    options = applyDefaultOptions(options, defaultOptions)

    log(`Fetching stats for ${path}`)

    const {
      cid,
      mfsDirectory,
      name
    } = await toMfsPath(context, path)

    if (cid.codec !== 'dag-pb') {
      throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
    }

    let node = await context.ipld.get(cid)
    const metadata = UnixFS.unmarshal(node.Data)

    if (typeof mode === 'string' || mode instanceof String) {
      if (mode.match(/^\d+$/g)) {
        mode = parseInt(mode, 8)
      } else {
        mode = mode.split(',').reduce((curr, acc) => {
          return parseSymbolicMode(acc, curr)
        }, metadata.mode)
      }
    }

    metadata.mode = mode
    node = new DAGNode(metadata.marshal(), node.Links)

    const updatedCid = await context.ipld.put(node, mc.DAG_PB, {
      cidVersion: cid.version,
      hashAlg: mh.names['sha2-256'],
      onlyHash: !options.flush
    })

    const trail = await toTrail(context, mfsDirectory, options)
    const parent = trail[trail.length - 1]
    const parentNode = await context.ipld.get(parent.cid)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      cid: updatedCid,
      size: node.serialize().length,
      flush: options.flush,
      format: 'dag-pb',
      hashAlg: 'sha2-256',
      cidVersion: cid.version
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, options)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid)
  }
}
