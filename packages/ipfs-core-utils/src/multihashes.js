/**
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('./types').LoadHasherFn} LoadHasherFn
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @type {LoadHasherFn}
 */
const LOAD_HASHER = (codeOrName) => Promise.reject(new Error(`No hasher found for "${codeOrName}"`))

export class Multihashes {
  /**
   * @param {object} options
   * @param {LoadHasherFn} [options.loadHasher]
   * @param {MultihashHasher[]} options.hashers
   */
  constructor (options) {
    // Object with current list of active hashers
    /** @type {Record<string, MultihashHasher>}} */
    this._hashersByName = {}

    // Object with current list of active hashers
    /** @type {Record<number, MultihashHasher>}} */
    this._hashersByCode = {}

    this._loadHasher = options.loadHasher || LOAD_HASHER

    // Enable all supplied hashers
    for (const hasher of options.hashers) {
      this.addHasher(hasher)
    }
  }

  /**
   * Add support for a multibase hasher
   *
   * @param {MultihashHasher} hasher
   */
  addHasher (hasher) {
    if (this._hashersByName[hasher.name] || this._hashersByCode[hasher.code]) {
      throw new Error(`Resolver already exists for codec "${hasher.name}"`)
    }

    this._hashersByName[hasher.name] = hasher
    this._hashersByCode[hasher.code] = hasher
  }

  /**
   * Remove support for a multibase hasher
   *
   * @param {MultihashHasher} hasher
   */
  removeHasher (hasher) {
    delete this._hashersByName[hasher.name]
    delete this._hashersByCode[hasher.code]
  }

  /**
   * @param {number | string} code
   */
  async getHasher (code) {
    const table = typeof code === 'string' ? this._hashersByName : this._hashersByCode

    if (table[code]) {
      return table[code]
    }

    // If not supported, attempt to dynamically load this hasher
    const hasher = await this._loadHasher(code)

    if (table[code] == null) {
      this.addHasher(hasher)
    }

    return hasher
  }

  listHashers () {
    return Object.values(this._hashersByName)
  }
}
