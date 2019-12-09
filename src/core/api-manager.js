module.exports = class ApiManager {
  constructor () {
    this._api = {}
    this._onUndef = () => undefined
    this.api = new Proxy({}, {
      get: (_, prop) => {
        if (prop === 'then') return undefined // Not a promise!
        return this._api[prop] === undefined ? this._onUndef(prop) : this._api[prop]
      },
      has: (_, prop) => prop in this._api
    })
  }

  update (nextApi, onUndef) {
    const prevApi = this._api
    const prevUndef = this._onUndef
    this._api = nextApi
    if (onUndef) this._onUndef = onUndef
    return { cancel: () => this.update(prevApi, prevUndef), api: this.api }
  }
}
