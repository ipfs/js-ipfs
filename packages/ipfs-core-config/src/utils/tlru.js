import hashlru from 'hashlru'

/**
 * Time Aware Least Recent Used Cache
 *
 * @see https://arxiv.org/pdf/1801.00390
 * @todo move this to ipfs-utils or it's own package
 *
 * @template T
 * @class TLRU
 */
export class TLRU {
  /**
   * Creates an instance of TLRU.
   *
   * @param {number} maxSize
   */
  constructor (maxSize) {
    this.lru = hashlru(maxSize)
  }

  /**
   * Get the value from the a key
   *
   * @param {string} key
   * @returns {T|undefined}
   * @memberof TLoRU
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
   * @param {T} value
   * @param {number} ttl - in miliseconds
   * @returns {void}
   */
  set (key, value, ttl) {
    this.lru.set(key, { value, expire: Date.now() + ttl })
  }

  /**
   * Find if the cache has the key
   *
   * @param {string} key
   * @returns {boolean}
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
