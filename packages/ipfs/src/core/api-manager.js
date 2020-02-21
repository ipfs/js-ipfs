'use strict'

module.exports = class ApiManager {
  constructor () {
    this._api = {}
    this._onUndef = () => undefined
    this.api = new Proxy(this._api, {
      get: (_, prop) => {
        if (prop === 'then') return undefined // Not a promise!
        return this._api[prop] === undefined ? this._onUndef(prop) : this._api[prop]
      }
    })
  }

  update (nextApi, onUndef) {
    const prevApi = { ...this._api }
    const prevUndef = this._onUndef
    Object.keys(this._api).forEach(k => { delete this._api[k] })
    Object.assign(this._api, nextApi)
    if (onUndef) this._onUndef = onUndef
    return { cancel: () => this.update(prevApi, prevUndef), api: this.api }
  }
}
