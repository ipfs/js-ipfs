import hashlru from 'hashlru'
import { BaseDatastore } from 'datastore-core/base'
import each from 'it-foreach'

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore/key').Key} Key
 * @typedef {import('interface-datastore').Options} Options
 * @typedef {import('interface-datastore').Pair} Pair
 * @typedef {import('interface-datastore').Batch} Batch
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').KeyQuery} KeyQuery
 * @typedef {import('interface-store').AwaitIterable<Pair>} AwaitIterablePair
 * @typedef {import('interface-store').AwaitIterable<Key>} AwaitIterableKey
 */

/**
 * A datastore with an internal LRU cache
 */
export class LRUDatastore extends BaseDatastore {
  /**
   * Creates an instance of TLRU.
   *
   * @param {number} maxSize
   * @param {Datastore} datastore
   */
  constructor (maxSize, datastore) {
    super()
    this.lru = hashlru(maxSize)
    this.child = datastore
  }

  /**
   * @returns {Promise<void>}
   */
  open () {
    return this.child.open()
  }

  /**
   * @returns {Promise<void>}
   */
  close () {
    return this.child.close()
  }

  /**
   * @param {Key} key
   * @param {Uint8Array} val
   * @param {Options} [options]
   */
  put (key, val, options) {
    this.lru.set(key.toString(), val)

    return this.child.put(key, val, options)
  }

  /**
   * @param {Key} key
   * @param {Options} [options]
   */
  async get (key, options) {
    if (this.lru.has(key.toString())) {
      return this.lru.get(key.toString())
    }

    return this.child.get(key, options)
  }

  /**
   * @param {Key} key
   * @param {Options} [options]
   */
  async has (key, options) {
    if (this.lru.has(key.toString())) {
      return true
    }

    return this.child.has(key, options)
  }

  /**
   * @param {Key} key
   * @param {Options} [options]
   */
  delete (key, options) {
    this.lru.remove(key.toString())

    return this.child.delete(key, options)
  }

  /**
   * @param {AwaitIterablePair} source
   * @param {Options} [options]
   */
  async * putMany (source, options) {
    yield * this.child.putMany(each(source, (pair) => {
      this.lru.set(pair.key.toString(), pair.value)
    }), options)
  }

  /**
   * @param {AwaitIterableKey} source
   * @param {Options} [options]
   */
  async * getMany (source, options) {
    for await (const key of source) {
      if (this.lru.has(key.toString())) {
        yield this.lru.get(key.toString())
      }

      yield this.child.get(key, options)
    }
  }

  /**
   * @param {AwaitIterableKey} source
   * @param {Options} [options]
   */
  async * deleteMany (source, options) {
    yield * this.child.deleteMany(each(source, (key) => {
      this.lru.remove(key.toString())
    }), options)
  }

  /**
   * @returns {Batch}
   */
  batch () {
    return this.child.batch()
  }

  /**
   * @param {Query} q
   * @param {Options} [options]
   */
  async * query (q, options) {
    yield * this.child.query(q, options)
  }

  /**
   * @param {KeyQuery} q
   * @param {Options} [options]
   */
  async * queryKeys (q, options) {
    yield * this.child.queryKeys(q, options)
  }
}
