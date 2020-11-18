'use strict'

const log = require('debug')('ipfs:mfs:write')
const importer = require('ipfs-unixfs-importer')
const stat = require('./stat')
const mkdir = require('./mkdir')
const addLink = require('./utils/add-link')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const createLock = require('./utils/create-lock')
const toAsyncIterator = require('./utils/to-async-iterator')
const toMfsPath = require('./utils/to-mfs-path')
const toPathComponents = require('./utils/to-path-components')
const toTrail = require('./utils/to-trail')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const errCode = require('err-code')
const {
  MFS_MAX_CHUNK_SIZE
} = require('../../utils')
const last = require('it-last')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const defaultOptions = {
  offset: 0, // the offset in the file to begin writing
  length: undefined, // how many bytes from the incoming buffer to write
  create: false, // whether to create the file if it does not exist
  truncate: false, // whether to truncate the file first
  rawLeaves: false,
  reduceSingleLeafToSelf: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  parents: false, // whether to create intermediate directories if they do not exist
  progress: () => {},
  strategy: 'trickle',
  flush: true,
  leafType: 'raw',
  shardSplitThreshold: 1000,
  mode: undefined,
  mtime: undefined,
  signal: undefined
}

module.exports = (context) => {
  /**
   * Write to an MFS path
   *
   * @param {string} path - The MFS path where you will write to
   * @param {string|Uint8Array|AsyncIterable<Uint8Array>|Blob} content - The content to write to the path
   * @param {WriteOptions & AbortOptions} [options]
   * @returns {Promise<void>}
   */
  async function mfsWrite (path, content, options = {}) {
    options = mergeOptions(defaultOptions, options)

    let source, destination, parent
    log('Reading source, destination and parent')
    await createLock().readLock(async () => {
      source = await toAsyncIterator(content)
      destination = await toMfsPath(context, path, options)
      parent = await toMfsPath(context, destination.mfsDirectory, options)
    })()
    log('Read source, destination and parent')
    // @ts-ignore - parent maybe undefined
    if (!options.parents && !parent.exists) {
      throw errCode(new Error('directory does not exist'), 'ERR_NO_EXIST')
    }

    // @ts-ignore - parent maybe undefined
    if (!options.create && !destination.exists) {
      throw errCode(new Error('file does not exist'), 'ERR_NO_EXIST')
    }

    return updateOrImport(context, path, source, destination, options)
  }

  return withTimeoutOption(mfsWrite)
}

const updateOrImport = async (context, path, source, destination, options) => {
  const child = await write(context, source, destination, options)

  // The slow bit is done, now add or replace the DAGLink in the containing directory
  // re-reading the path to the containing folder in case it has changed in the interim
  await createLock().writeLock(async () => {
    const pathComponents = toPathComponents(path)
    const fileName = pathComponents.pop()
    let parentExists = false

    try {
      await stat(context)(`/${pathComponents.join('/')}`, options)
      parentExists = true
    } catch (err) {
      if (err.code !== 'ERR_NOT_FOUND') {
        throw err
      }
    }

    if (!parentExists) {
      await mkdir(context)(`/${pathComponents.join('/')}`, options)
    }

    // get an updated mfs path in case the root changed while we were writing
    const updatedPath = await toMfsPath(context, path, options)
    const trail = await toTrail(context, updatedPath.mfsDirectory)
    const parent = trail[trail.length - 1]

    if (!parent.type.includes('directory')) {
      throw errCode(new Error(`cannot write to ${parent.name}: Not a directory`), 'ERR_NOT_A_DIRECTORY')
    }

    const parentNode = await context.ipld.get(parent.cid)

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

const write = async (context, source, destination, options) => {
  if (destination.exists) {
    log(`Overwriting file ${destination.cid} offset ${options.offset} length ${options.length}`)
  } else {
    log(`Writing file offset ${options.offset} length ${options.length}`)
  }

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

  let mode

  if (options.mode !== undefined && options.mode !== null) {
    mode = options.mode
  } else if (destination && destination.unixfs) {
    mode = destination.unixfs.mode
  }

  let mtime

  if (options.mtime !== undefined && options.mtine !== null) {
    mtime = options.mtime
  } else if (destination && destination.unixfs) {
    mtime = destination.unixfs.mtime
  }

  const result = await last(importer([{
    content: content,

    // persist mode & mtime if set previously
    mode,
    mtime
  }], context.block, {
    progress: options.progress,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    strategy: options.strategy,
    rawLeaves: options.rawLeaves,
    reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
    leafType: options.leafType,
    pin: false
  }))

  log(`Wrote ${result.cid}`)

  return {
    cid: result.cid,
    size: result.size
  }
}

const limitAsyncStreamBytes = (stream, limit) => {
  return async function * _limitAsyncStreamBytes () {
    let emitted = 0

    for await (const buf of stream) {
      emitted += buf.length

      if (emitted > limit) {
        yield buf.slice(0, limit - emitted)

        return
      }

      yield buf
    }
  }
}

const asyncZeroes = (count, chunkSize = MFS_MAX_CHUNK_SIZE) => {
  const buf = new Uint8Array(chunkSize)

  const stream = {
    [Symbol.asyncIterator]: function * _asyncZeroes () {
      while (true) {
        yield buf.slice()
      }
    }
  }

  return limitAsyncStreamBytes(stream, count)
}

const catAsyncIterators = async function * (sources) { // eslint-disable-line require-await
  for (let i = 0; i < sources.length; i++) {
    yield * sources[i]()
  }
}

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

/**
 * @typedef {Object} WriteOptions
 * @property {number} [offset] - An offset to start writing to file at
 * @property {number} [length] - Optionally limit how many bytes are read from the stream
 * @property {boolean} [create=false] - Create the MFS path if it does not exist
 * @property {boolean} [parents=false] - Create intermediate MFS paths if they do not exist
 * @property {boolean} [truncate=false] - Truncate the file at the MFS path if it would have been larger than the passed content
 * @property {boolean} [rawLeaves=false] - If true, DAG leaves will contain raw file data and not be wrapped in a protobuf
 * @property {number} [mode] - An integer that represents the file mode
 * @property {Mtime|Hrtime|Date} [mtime] - A Date object, an object with `{ secs, nsecs }` properties where secs is the number of seconds since (positive) or before (negative) the Unix Epoch began and nsecs is the number of nanoseconds since the last full second, or the output of `process.hrtime()
 * @property {boolean} [flush] - If true the changes will be immediately flushed to disk
 * @property {string} [hashAlg='sha2-256'] - The hash algorithm to use for any updated entries
 * @property {0|1} [cidVersion=0] - The CID version to use for any updated entries
 *
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('../../utils').Mtime} Mtime
 * @typedef {import('../../utils').Hrtime} Hrtime
 */
