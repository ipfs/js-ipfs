/**
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 * @typedef {import('./types').LoadBaseFn} LoadBaseFn
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @type {LoadBaseFn}
 */
const LOAD_BASE = (name) => Promise.reject(new Error(`No base found for "${name}"`))

export class Multibases {
  /**
   * @param {object} options
   * @param {LoadBaseFn} [options.loadBase]
   * @param {MultibaseCodec[]} options.bases
   */
  constructor (options) {
    // Object with current list of active resolvers
    /** @type {Record<string, MultibaseCodec>}} */
    this._basesByName = {}

    // Object with current list of active resolvers
    /** @type {Record<string, MultibaseCodec>}} */
    this._basesByPrefix = {}

    this._loadBase = options.loadBase || LOAD_BASE

    // Enable all supplied codecs
    for (const base of options.bases) {
      this.addBase(base)
    }
  }

  /**
   * Add support for a multibase codec
   *
   * @param {MultibaseCodec} base
   */
  addBase (base) {
    if (this._basesByName[base.name] || this._basesByPrefix[base.prefix]) {
      throw new Error(`Codec already exists for codec "${base.name}"`)
    }

    this._basesByName[base.name] = base
    this._basesByPrefix[base.prefix] = base
  }

  /**
   * Remove support for a multibase codec
   *
   * @param {MultibaseCodec} base
   */
  removeBase (base) {
    delete this._basesByName[base.name]
    delete this._basesByPrefix[base.prefix]
  }

  /**
   * @param {string} nameOrPrefix
   */
  async getBase (nameOrPrefix) {
    if (this._basesByName[nameOrPrefix]) {
      return this._basesByName[nameOrPrefix]
    }

    if (this._basesByPrefix[nameOrPrefix]) {
      return this._basesByPrefix[nameOrPrefix]
    }

    // If not supported, attempt to dynamically load this codec
    const base = await this._loadBase(nameOrPrefix)

    if (this._basesByName[base.name] == null && this._basesByPrefix[base.prefix] == null) {
      this.addBase(base)
    }

    return base
  }

  listBases () {
    return Object.values(this._basesByName)
  }
}
