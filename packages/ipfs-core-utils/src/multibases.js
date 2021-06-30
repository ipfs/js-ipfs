'use strict'

/**
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 * @typedef {import('./types').LoadBaseFn} LoadBaseFn
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class Multibases {
  /**
   * @param {object} options
   * @param {LoadBaseFn} options.loadBase
   * @param {MultibaseCodec[]} options.bases
   */
  constructor (options) {
    // Object with current list of active resolvers
    /** @type {Record<string, MultibaseCodec>}} */
    this._codecsByName = {}

    // Object with current list of active resolvers
    /** @type {Record<string, MultibaseCodec>}} */
    this._codecsByPrefix = {}

    this._loadBase = options.loadBase

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
    if (this._codecsByName[base.name] || this._codecsByPrefix[base.prefix]) {
      throw new Error(`Codec already exists for codec "${base.name}"`)
    }

    this._codecsByName[base.name] = base
    this._codecsByPrefix[base.prefix] = base
  }

  /**
   * Remove support for a multibase codec
   *
   * @param {MultibaseCodec} base
   */
  removeBase (base) {
    delete this._codecsByName[base.name]
    delete this._codecsByPrefix[base.prefix]
  }

  /**
   * @param {string} nameOrPrefix
   */
  async getBase (nameOrPrefix) {
    if (this._codecsByName[nameOrPrefix]) {
      return this._codecsByName[nameOrPrefix]
    }

    if (this._codecsByPrefix[nameOrPrefix]) {
      return this._codecsByPrefix[nameOrPrefix]
    }

    // If not supported, attempt to dynamically load this codec
    const base = await this._loadBase(nameOrPrefix)

    if (this._codecsByName[base.name] == null && this._codecsByPrefix[base.prefix] == null) {
      this.addBase(base)
    }

    return base
  }
}

module.exports = Multibases
