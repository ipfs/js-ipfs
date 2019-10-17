module.exports = class ApiManager {
  constructor () {
    this._api = {}
    this._onUndef = () => undefined
    this.api = new Proxy({}, {
      get (target, prop) {
        return target[prop] === undefined
          ? this._onUndef(prop)
          : target[prop]
      }
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
