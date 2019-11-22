'use strict'

const log = require('debug')('ipfs:mfs:write')
const importer = require('ipfs-unixfs-importer')
const stat = require('./stat')
const mkdir = require('./mkdir')
const addLink = require('./utils/add-link')
const applyDefaultOptions = require('./utils/apply-default-options')
const createLock = require('./utils/create-lock')
const toAsyncIterator = require('./utils/to-async-iterator')
const toMfsPath = require('./utils/to-mfs-path')
const toPathComponents = require('./utils/to-path-components')
const toTrail = require('./utils/to-trail')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const errCode = require('err-code')
const {
  MAX_CHUNK_SIZE
} = require('./utils/constants')
const last = require('async-iterator-last')

const defaultOptions = {
  offset: 0, // the offset in the file to begin writing
  length: undefined, // how many bytes from the incoming buffer to write
  create: false, // whether to create the file if it does not exist
  truncate: false, // whether to truncate the file first
  rawLeaves: false,
  reduceSingleLeafToSelf: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  format: 'dag-pb',
  parents: false, // whether to create intermediate directories if they do not exist
  progress: () => {},
  strategy: 'trickle',
  flush: true,
  leafType: 'raw',
  shardSplitThreshold: 1000
}

module.exports = (context) => {
  return async function mfsWrite (path, content, options) {
    log('Hello world, writing', path, content, options)
    options = applyDefaultOptions(options, defaultOptions)

    let source, destination, parent
    log('Reading source, destination and parent')
    await createLock().readLock(async () => {
      source = await toAsyncIterator(content, options)
      destination = await toMfsPath(context, path)
      parent = await toMfsPath(context, destination.mfsDirectory)
    })()
    log('Read source, destination and parent')
    if (!options.parents && !parent.exists) {
      throw errCode(new Error('directory does not exist'), 'ERR_NO_EXIST')
    }

    if (!options.create && !destination.exists) {
      throw errCode(new Error('file does not exist'), 'ERR_NO_EXIST')
    }

    return updateOrImport(context, path, source, destination, options)
  }
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
    const updatedPath = await toMfsPath(context, path)
    const trail = await toTrail(context, updatedPath.mfsDirectory, options)
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
      format: options.format,
      hashAlg: options.hashAlg,
      cidVersion: options.cidVersion
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, options)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid)
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
    if (destination.unixfs && destination.unixfs.fileSize() > options.offset) {
      log(`Writing first ${options.offset} bytes of original file`)

      sources.push(
        () => {
          return destination.content({
            offset: 0,
            length: options.offset
          })
        }
      )
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

  const content = countBytesStreamed(catAsyncInterators(sources), (bytesWritten) => {
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

  const result = await last(importer([{
    content: content
  }], context.ipld, {
    progress: options.progress,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    strategy: options.strategy,
    rawLeaves: options.rawLeaves,
    reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
    leafType: options.leafType
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

const asyncZeroes = (count, chunkSize = MAX_CHUNK_SIZE) => {
  const buf = Buffer.alloc(chunkSize, 0)

  const stream = {
    [Symbol.asyncIterator]: function * _asyncZeroes () {
      while (true) {
        yield buf.slice()
      }
    }
  }

  return limitAsyncStreamBytes(stream, count)
}

const catAsyncInterators = async function * (sources) {
  for (let i = 0; i < sources.length; i++) {
    for await (const buf of sources[i]()) {
      yield buf
    }
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
