'use strict'

module.exports = class ApiManager {
  /**
   * @callback UndefFn
   * @param {PropertyKey} prop
   */

  /**
   * @template API
   * @typedef {{ cancel(): any; api: API; }} Updated
   */

  constructor () {
    this._api = {}
    /**
     * @type {UndefFn}
     * @returns {any}
     */
    this._onUndef = () => undefined
    this.api = new Proxy(this._api, {
      get: (_, prop) => {
        if (prop === 'then') return undefined // Not a promise!
        return this._api[prop] === undefined ? this._onUndef(prop) : this._api[prop]
      }
    })
  }

  /**
   * @template A
   * @param {A} nextApi
   * @param {UndefFn} [onUndef]
   * @returns {Updated<A>}
   */
  update (nextApi, onUndef) {
    const prevApi = { ...this._api }
    const prevUndef = this._onUndef
    Object.keys(this._api).forEach(k => { delete this._api[k] })
    const api = Object.assign(this._api, nextApi)
    if (onUndef) this._onUndef = onUndef
    return { cancel: () => this.update(prevApi, prevUndef), api }
  }
}
