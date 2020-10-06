'use strict'
const hashlru = require('hashlru')

/**
 * Time Aware Least Recent Used Cache
 * @see https://arxiv.org/pdf/1801.00390
 * @todo move this to ipfs-utils or it's own package
 *
 * @class TLRU
 */
class TLRU {
  /**
   * Creates an instance of TLRU.
   *
   * @param {number} maxSize
   * @memberof TLRU
   */
  constructor (maxSize) {
    this.lru = hashlru(maxSize)
  }

  /**
   * Get the value from the a key
   *
   * @param {string} key
   * @returns {any}
   * @memberof TLRU
   */
  get (key) {
    const value = this.lru.get(key)
    if (value) {
      if ((value.expire) && (value.expire < Date.now())) {
        this.lru.remove(key)
        return undefined
      }
      return value.value
    }
    return undefined
  }

  /**
   * Set a key value pair
   *
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - in miliseconds
   * @memberof TLRU
   */
  set (key, value, ttl) {
    this.lru.set(key, { value, expire: Date.now() + ttl })
  }

  /**
   * Find if the cache has the key
   *
   * @param {string} key
   * @returns {boolean}
   * @memberof TLRU
   */
  has (key) {
    const value = this.get(key)
    if (value) {
      return true
    }
    return false
  }

  /**
   * Remove key
   *
   * @param {string} key
   * @memberof TLRU
   */
  remove (key) {
    this.lru.remove(key)
  }

  /**
   * Clears the cache
   *
   * @memberof TLRU
   */
  clear () {
    this.lru.clear()
  }
}

module.exports = TLRU
