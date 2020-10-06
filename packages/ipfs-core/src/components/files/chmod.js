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
const { pipe } = require('it-pipe')
const importer = require('ipfs-unixfs-importer')
const exporter = require('ipfs-unixfs-exporter')
const last = require('it-last')
const cp = require('./cp')
const rm = require('./rm')
const persist = require('ipfs-unixfs-importer/src/utils/persist')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  flush: true,
  shardSplitThreshold: 1000,
  hashAlg: 'sha2-256',
  cidVersion: 0,
  recursive: false,
  signal: undefined
}

function calculateModification (mode, originalMode, isDirectory) {
  let modification = 0

  if (mode.includes('x') || (mode.includes('X') && (isDirectory || (originalMode & 0o1 || originalMode & 0o10 || originalMode & 0o100)))) {
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
function parseSymbolicMode (input, originalMode, isDirectory) {
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

  let modification = calculateModification(mode, originalMode, isDirectory)
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

function calculateMode (mode, metadata) {
  if (typeof mode === 'string' || mode instanceof String) {
    if (mode.match(/^\d+$/g)) {
      mode = parseInt(mode, 8)
    } else {
      mode = mode.split(',').reduce((curr, acc) => {
        return parseSymbolicMode(acc, curr, metadata.isDirectory())
      }, metadata.mode)
    }
  }

  return mode
}

module.exports = (context) => {
  return withTimeoutOption(async function mfsChmod (path, mode, options) {
    options = applyDefaultOptions(options, defaultOptions)

    log(`Fetching stats for ${path}`)

    const {
      cid,
      mfsDirectory,
      name
    } = await toMfsPath(context, path, options)

    if (cid.codec !== 'dag-pb') {
      throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
    }

    if (options.recursive) {
      // recursively export from root CID, change perms of each entry then reimport
      // but do not reimport files, only manipulate dag-pb nodes
      const root = await pipe(
        async function * () {
          for await (const entry of exporter.recursive(cid, context.ipld)) {
            let node = await context.ipld.get(entry.cid)
            entry.unixfs.mode = calculateMode(mode, entry.unixfs)
            node = new DAGNode(entry.unixfs.marshal(), node.Links)

            yield {
              path: entry.path,
              content: node
            }
          }
        },
        (source) => importer(source, context.block, {
          ...options,
          pin: false,
          dagBuilder: async function * (source, block, options) {
            for await (const entry of source) {
              yield async function () {
                const cid = await persist(entry.content.serialize(), block, options)

                return {
                  cid,
                  path: entry.path,
                  unixfs: UnixFS.unmarshal(entry.content.Data),
                  node: entry.content
                }
              }
            }
          }
        }),
        (nodes) => last(nodes)
      )

      // remove old path from mfs
      await rm(context)(path, options)

      // add newly created tree to mfs at path
      await cp(context)(`/ipfs/${root.cid}`, path, options)

      return
    }

    let node = await context.ipld.get(cid)
    const metadata = UnixFS.unmarshal(node.Data)
    metadata.mode = calculateMode(mode, metadata)
    node = new DAGNode(metadata.marshal(), node.Links)

    const updatedCid = await context.ipld.put(node, mc.DAG_PB, {
      cidVersion: cid.version,
      hashAlg: mh.names[options.hashAlg],
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
      hashAlg: options.hashAlg,
      cidVersion: cid.version
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, options)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, options)
  })
}
