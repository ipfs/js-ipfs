import { logger } from '@libp2p/logger'
import { importer } from 'ipfs-unixfs-importer'
import {
  decode
} from '@ipld/dag-pb'
import { createStat } from './stat.js'
import { createMkdir } from './mkdir.js'
import { addLink } from './utils/add-link.js'
import mergeOpts from 'merge-options'
import { createLock } from './utils/create-lock.js'
import { toAsyncIterator } from './utils/to-async-iterator.js'
import { toMfsPath } from './utils/to-mfs-path.js'
import { toPathComponents } from './utils/to-path-components.js'
import { toTrail } from './utils/to-trail.js'
import { updateTree } from './utils/update-tree.js'
import { updateMfsRoot } from './utils/update-mfs-root.js'
import errCode from 'err-code'
import {
  MFS_MAX_CHUNK_SIZE
} from '../../utils.js'
import last from 'it-last'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import {
  parseMode,
  parseMtime
} from 'ipfs-unixfs'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:mfs:write')

/**
 * @typedef {import('multiformats/cid').Version} CIDVersion
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {import('./utils/to-mfs-path').FilePath} FilePath
 * @typedef {import('./utils/to-mfs-path').MfsPath} MfsPath
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 *
 * @typedef {object} DefaultOptions
 * @property {number} offset
 * @property {number} length
 * @property {boolean} create
 * @property {boolean} truncate
 * @property {boolean} rawLeaves
 * @property {boolean} reduceSingleLeafToSelf
 * @property {CIDVersion} cidVersion
 * @property {string} hashAlg
 * @property {boolean} parents
 * @property {import('ipfs-core-types/src/root').AddProgressFn} progress
 * @property {'trickle' | 'balanced'} strategy
 * @property {boolean} flush
 * @property {'raw' | 'file'} leafType
 * @property {number} shardSplitThreshold
 * @property {MtimeLike} [mtime]
 * @property {number} [mode]
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  offset: 0, // the offset in the file to begin writing
  length: Infinity, // how many bytes from the incoming buffer to write
  create: false, // whether to create the file if it does not exist
  truncate: false, // whether to truncate the file first
  rawLeaves: false,
  reduceSingleLeafToSelf: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  parents: false, // whether to create intermediate directories if they do not exist
  progress: (bytes, path) => {},
  strategy: 'trickle',
  flush: true,
  leafType: 'raw',
  shardSplitThreshold: 1000
}

/**
 * @param {MfsContext} context
 */
export function createWrite (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["write"]}
   */
  async function mfsWrite (path, content, opts = {}) {
    /** @type {DefaultOptions} */
    const options = mergeOptions(defaultOptions, opts)

    /** @type {AsyncIterable<Uint8Array>} */
    let source
    /** @type {MfsPath} */
    let destination
    /** @type {MfsPath} */
    let parent
    log('Reading source, destination and parent')
    await createLock().readLock(async () => {
      source = await toAsyncIterator(content)
      destination = await toMfsPath(context, path, options)
      parent = await toMfsPath(context, destination.mfsDirectory, options)
    })()
    log('Read source, destination and parent')
    // @ts-expect-error - parent may be undefined
    if (!options.parents && !parent.exists) {
      throw errCode(new Error('directory does not exist'), 'ERR_NO_EXIST')
    }

    // @ts-expect-error
    if (source == null) {
      throw errCode(new Error('could not create source'), 'ERR_NO_SOURCE')
    }

    // @ts-expect-error
    if (destination == null) {
      throw errCode(new Error('could not create destination'), 'ERR_NO_DESTINATION')
    }

    if (!options.create && !destination.exists) {
      throw errCode(new Error('file does not exist'), 'ERR_NO_EXIST')
    }

    if (destination.entryType !== 'file') {
      throw errCode(new Error('not a file'), 'ERR_NOT_A_FILE')
    }

    return updateOrImport(context, path, source, destination, options)
  }

  return withTimeoutOption(mfsWrite)
}

/**
 * @param {MfsContext} context
 * @param {string} path
 * @param {AsyncIterable<Uint8Array>} source
 * @param {FilePath} destination
 * @param {DefaultOptions} options
 */
const updateOrImport = async (context, path, source, destination, options) => {
  const child = await write(context, source, destination, options)

  // The slow bit is done, now add or replace the DAGLink in the containing directory
  // re-reading the path to the containing folder in case it has changed in the interim
  await createLock().writeLock(async () => {
    const pathComponents = toPathComponents(path)
    const fileName = pathComponents.pop()

    if (fileName == null) {
      throw errCode(new Error('source does not exist'), 'ERR_NO_EXIST')
    }

    let parentExists = false

    try {
      await createStat(context)(`/${pathComponents.join('/')}`, options)
      parentExists = true
    } catch (/** @type {any} */ err) {
      if (err.code !== 'ERR_NOT_FOUND') {
        throw err
      }
    }

    if (!parentExists) {
      await createMkdir(context)(`/${pathComponents.join('/')}`, options)
    }

    // get an updated mfs path in case the root changed while we were writing
    const updatedPath = await toMfsPath(context, path, options)
    const trail = await toTrail(context, updatedPath.mfsDirectory)
    const parent = trail[trail.length - 1]

    if (!parent) {
      throw errCode(new Error('directory does not exist'), 'ERR_NO_EXIST')
    }

    if (!parent.type || !parent.type.includes('directory')) {
      throw errCode(new Error(`cannot write to ${parent.name}: Not a directory`), 'ERR_NOT_A_DIRECTORY')
    }

    const parentBlock = await context.repo.blocks.get(parent.cid)
    const parentNode = decode(parentBlock)

    const result = await addLink(context, {
      parent: parentNode,
      name: fileName,
      cid: child.cid,
      size: child.size,
      flush: options.flush,
      shardSplitThreshold: options.shardSplitThreshold,
      hashAlg: options.hashAlg,
      cidVersion: options.cidVersion
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, options)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, options)
  })()
}

/**
 * @param {MfsContext} context
 * @param {AsyncIterable<Uint8Array>} source
 * @param {FilePath} destination
 * @param {DefaultOptions} options
 */
const write = async (context, source, destination, options) => {
  if (destination.exists) {
    log(`Overwriting file ${destination.cid} offset ${options.offset} length ${options.length}`)
  } else {
    log(`Writing file offset ${options.offset} length ${options.length}`)
  }

  /** @type {Array<() => AsyncIterable<Uint8Array>>} */
  const sources = []

  // pad start of file if necessary
  if (options.offset > 0) {
    if (destination.unixfs) {
      log(`Writing first ${options.offset} bytes of original file`)

      sources.push(
        () => {
          return destination.content({
            offset: 0,
            length: options.offset
          })
        }
      )

      if (destination.unixfs.fileSize() < options.offset) {
        const extra = options.offset - destination.unixfs.fileSize()

        log(`Writing zeros for extra ${extra} bytes`)
        sources.push(
          asyncZeroes(extra)
        )
      }
    } else {
      log(`Writing zeros for first ${options.offset} bytes`)
      sources.push(
        asyncZeroes(options.offset)
      )
    }
  }

  sources.push(
    limitAsyncStreamBytes(source, options.length)
  )

  const content = countBytesStreamed(catAsyncIterators(sources), (bytesWritten) => {
    if (destination.unixfs && !options.truncate) {
      // if we've done reading from the new source and we are not going
      // to truncate the file, add the end of the existing file to the output
      const fileSize = destination.unixfs.fileSize()

      if (fileSize > bytesWritten) {
        log(`Writing last ${fileSize - bytesWritten} of ${fileSize} bytes from original file starting at offset ${bytesWritten}`)

        return destination.content({
          offset: bytesWritten
        })
      } else {
        log('Not writing last bytes from original file')
      }
    }

    return {
      [Symbol.asyncIterator]: async function * () {}
    }
  })

  /** @type {number | undefined} */
  let mode

  if (options.mode !== undefined && options.mode !== null) {
    mode = parseMode(options.mode)
  } else if (destination && destination.unixfs) {
    mode = destination.unixfs.mode
  }

  /** @type {import('ipfs-unixfs').Mtime | undefined} */
  let mtime

  if (options.mtime != null) {
    mtime = parseMtime(options.mtime)
  } else if (destination && destination.unixfs) {
    mtime = destination.unixfs.mtime
  }

  const hasher = await context.hashers.getHasher(options.hashAlg)

  const result = await last(importer([{
    content: content,

    // persist mode & mtime if set previously
    mode,
    mtime
  }], context.repo.blocks, {
    progress: options.progress,
    hasher,
    cidVersion: options.cidVersion,
    strategy: options.strategy,
    rawLeaves: options.rawLeaves,
    reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
    leafType: options.leafType
  }))

  if (!result) {
    throw errCode(new Error(`cannot write to ${parent.name}`), 'ERR_COULD_NOT_WRITE')
  }

  log(`Wrote ${result.cid}`)

  return {
    cid: result.cid,
    size: result.size
  }
}

/**
 * @param {AsyncIterable<Uint8Array>} stream
 * @param {number} limit
 */
const limitAsyncStreamBytes = (stream, limit) => {
  return async function * _limitAsyncStreamBytes () {
    let emitted = 0

    for await (const buf of stream) {
      emitted += buf.length

      if (emitted > limit) {
        yield buf.subarray(0, limit - emitted)

        return
      }

      yield buf
    }
  }
}

/**
 * @param {number} count
 * @param {number} chunkSize
 */
const asyncZeroes = (count, chunkSize = MFS_MAX_CHUNK_SIZE) => {
  const buf = new Uint8Array(chunkSize)

  async function * _asyncZeroes () {
    while (true) {
      yield buf
    }
  }

  return limitAsyncStreamBytes(_asyncZeroes(), count)
}

/**
 * @param {Array<() => AsyncIterable<Uint8Array>>} sources
 */
const catAsyncIterators = async function * (sources) { // eslint-disable-line require-await
  for (let i = 0; i < sources.length; i++) {
    yield * sources[i]()
  }
}

/**
 * @param {AsyncIterable<Uint8Array>} source
 * @param {(count: number) => AsyncIterable<Uint8Array>} notify
 */
const countBytesStreamed = async function * (source, notify) {
  let wrote = 0

  for await (const buf of source) {
    wrote += buf.length

    yield buf
  }

  for await (const buf of notify(wrote)) {
    wrote += buf.length

    yield buf
  }
}
