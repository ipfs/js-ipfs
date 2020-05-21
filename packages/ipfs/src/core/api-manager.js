'use strict'

/**
 * @template T
 * @typedef {import("ipfs-interface").Values<T>} Values
 */

/**
 * @template U
 * @typedef {import("ipfs-interface").UnionToIntersection<U>} UnionToIntersection
 */

/**
 * @template T
 * @typedef {Object} APIUpdate
 * @property {UnionToIntersection<Values<T>>} api
 * @property {function():void} cancel
 */

module.exports = class ApiManager {
  constructor () {
    /** @type {Record<string, any>} */
    this._api = {}
    this._onUndef = () => undefined
    /** @type {any} */
    this.api = new Proxy(this._api, {
      get: (_, prop) => {
        if (prop === 'then') return undefined // Not a promise!
        // @ts-ignore
        return this._api[prop] === undefined ? this._onUndef(prop) : this._api[prop]
      }
    })
  }

  /**
   * @template T
   * @param {T} nextApi
   * @param {function(): any} [onUndef]
   * @returns {APIUpdate<T>}
   */
  update (nextApi, onUndef) {
    const prevApi = { ...this._api }
    const prevUndef = this._onUndef
    Object.keys(this._api).forEach(k => { delete this._api[k] })
    Object.assign(this._api, nextApi)
    if (onUndef) this._onUndef = onUndef
    return { cancel: () => this.update(prevApi, prevUndef), api: this.api }
  }
}
