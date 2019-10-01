'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
const { cidToString } = require('../../../utils/cid')
const toPullStream = require('async-iterator-to-pull-stream')

const normalizePath = (path) => {
  if (Buffer.isBuffer(path)) {
    return new CID(path).toString()
  }
  if (CID.isCID(path)) {
    return path.toString()
  }
  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }
  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }
  return path
}

/**
 * Parses chunker string into options used by DAGBuilder in ipfs-unixfs-engine
 *
 *
 * @param  {String}   chunker Chunker algorithm supported formats:
 *                    "size-{size}"
 *                    "rabin"
 *                    "rabin-{avg}"
 *                    "rabin-{min}-{avg}-{max}"
 *
 * @return {Object}   Chunker options for DAGBuilder
 */
const parseChunkerString = (chunker) => {
  if (!chunker) {
    return {
      chunker: 'fixed'
    }
  } else if (chunker.startsWith('size-')) {
    const sizeStr = chunker.split('-')[1]
    const size = parseInt(sizeStr)
    if (isNaN(size)) {
      throw new Error('Chunker parameter size must be an integer')
    }
    return {
      chunker: 'fixed',
      chunkerOptions: {
        maxChunkSize: size
      }
    }
  } else if (chunker.startsWith('rabin')) {
    return {
      chunker: 'rabin',
      chunkerOptions: parseRabinString(chunker)
    }
  } else {
    throw new Error(`Unrecognized chunker option: ${chunker}`)
  }
}

/**
 * Parses rabin chunker string
 *
 * @param  {String}   chunker Chunker algorithm supported formats:
 *                            "rabin"
 *                            "rabin-{avg}"
 *                            "rabin-{min}-{avg}-{max}"
 *
 * @return {Object}   rabin chunker options
 */
const parseRabinString = (chunker) => {
  const options = {}
  const parts = chunker.split('-')
  switch (parts.length) {
    case 1:
      options.avgChunkSize = 262144
      break
    case 2:
      options.avgChunkSize = parseChunkSize(parts[1], 'avg')
      break
    case 4:
      options.minChunkSize = parseChunkSize(parts[1], 'min')
      options.avgChunkSize = parseChunkSize(parts[2], 'avg')
      options.maxChunkSize = parseChunkSize(parts[3], 'max')
      break
    default:
      throw new Error('Incorrect chunker format (expected "rabin" "rabin-[avg]" or "rabin-[min]-[avg]-[max]"')
  }

  return options
}

const parseChunkSize = (str, name) => {
  const size = parseInt(str)
  if (isNaN(size)) {
    throw new Error(`Chunker parameter ${name} must be an integer`)
  }

  return size
}

const mapFile = (options) => {
  options = options || {}

  return (file) => {
    let size = 0
    let type = 'dir'

    if (file.unixfs && file.unixfs.type === 'file') {
      size = file.unixfs.fileSize()
      type = 'file'
    }

    const output = {
      hash: cidToString(file.cid, { base: options.cidBase }),
      path: file.path,
      name: file.name,
      depth: file.path.split('/').length,
      size,
      type
    }

    if (options.includeContent && file.unixfs && file.unixfs.type === 'file') {
      output.content = toPullStream.source(file.content())
    }

    return output
  }
}

module.exports = {
  normalizePath,
  parseChunkSize,
  parseRabinString,
  parseChunkerString,
  mapFile
}
