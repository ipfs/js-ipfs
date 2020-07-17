'use strict'

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
      maxChunkSize: size
    }
  } else if (chunker.startsWith('rabin')) {
    return {
      chunker: 'rabin',
      ...parseRabinString(chunker)
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

module.exports = {
  parseChunkSize,
  parseRabinString,
  parseChunkerString
}
