/**
 * @typedef {object} FixedChunkerOptions
 * @property {'fixed'} chunker
 * @property {number} [maxChunkSize]
 *
 * @typedef {object} RabinChunkerOptions
 * @property {'rabin'} chunker
 * @property {number} avgChunkSize
 * @property {number} [minChunkSize]
 * @property {number} [maxChunkSize]
 *
 * @typedef {FixedChunkerOptions|RabinChunkerOptions} ChunkerOptions
 *
 * Parses chunker string into options used by DAGBuilder in ipfs-unixfs-engine
 *
 *
 * @param  {string} [chunker] - Chunker algorithm supported formats:
 * "size-{size}"
 * "rabin"
 * "rabin-{avg}"
 * "rabin-{min}-{avg}-{max}"
 *
 * @returns {ChunkerOptions}   Chunker options for DAGBuilder
 */
export const parseChunkerString = (chunker) => {
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
 * @typedef {object} RabinChunkerSettings
 * @property {number} avgChunkSize
 * @property {number} [minChunkSize]
 * @property {number} [maxChunkSize]
 *
 * Parses rabin chunker string
 *
 * @param  {string}   chunker - Chunker algorithm supported formats:
 * "rabin"
 * "rabin-{avg}"
 * "rabin-{min}-{avg}-{max}"
 *
 * @returns {RabinChunkerSettings}   rabin chunker options
 */
export const parseRabinString = (chunker) => {
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

/**
 *
 * @param {string} str
 * @param {string} name
 * @returns {number}
 */
export const parseChunkSize = (str, name) => {
  const size = parseInt(str)
  if (isNaN(size)) {
    throw new Error(`Chunker parameter ${name} must be an integer`)
  }

  return size
}
