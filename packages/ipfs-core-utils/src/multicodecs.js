/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('./types').LoadCodecFn} LoadCodecFn
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @type {LoadCodecFn}
 */
const LOAD_CODEC = (codeOrName) => Promise.reject(new Error(`No codec found for "${codeOrName}"`))

export class Multicodecs {
  /**
   * @param {object} options
   * @param {LoadCodecFn} [options.loadCodec]
   * @param {BlockCodec[]} options.codecs
   */
  constructor (options) {
    // Object with current list of active resolvers
    /** @type {Record<string, BlockCodec>}} */
    this._codecsByName = {}

    // Object with current list of active resolvers
    /** @type {Record<number, BlockCodec>}} */
    this._codecsByCode = {}

    this._loadCodec = options.loadCodec || LOAD_CODEC

    // Enable all supplied codecs
    for (const codec of options.codecs) {
      this.addCodec(codec)
    }
  }

  /**
   * Add support for a block codec
   *
   * @param {BlockCodec} codec
   */
  addCodec (codec) {
    if (this._codecsByName[codec.name] || this._codecsByCode[codec.code]) {
      throw new Error(`Resolver already exists for codec "${codec.name}"`)
    }

    this._codecsByName[codec.name] = codec
    this._codecsByCode[codec.code] = codec
  }

  /**
   * Remove support for a block codec
   *
   * @param {BlockCodec} codec
   */
  removeCodec (codec) {
    delete this._codecsByName[codec.name]
    delete this._codecsByCode[codec.code]
  }

  /**
   * @param {number | string} code
   */
  async getCodec (code) {
    const table = typeof code === 'string' ? this._codecsByName : this._codecsByCode

    if (table[code]) {
      return table[code]
    }

    // If not supported, attempt to dynamically load this codec
    const codec = await this._loadCodec(code)

    if (table[code] == null) {
      this.addCodec(codec)
    }

    return codec
  }

  listCodecs () {
    return Object.values(this._codecsByName)
  }
}
