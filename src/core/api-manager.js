'use strict'

const noop = () => {}
const defaultApi = (onUndef = noop) => ({
  add: onUndef,
  bitswap: {
    stat: onUndef,
    unwant: onUndef,
    wantlist: onUndef
  },
  block: {
    get: onUndef,
    put: onUndef,
    rm: onUndef,
    stat: onUndef
  },
  bootstrap: {
    add: onUndef,
    list: onUndef,
    rm: onUndef
  },
  cat: onUndef,
  config: onUndef,
  dag: {
    get: onUndef,
    put: onUndef,
    resolve: onUndef,
    tree: onUndef
  },
  dns: onUndef,
  files: {
    chmod: onUndef,
    cp: onUndef,
    flush: onUndef,
    ls: onUndef,
    mkdir: onUndef,
    mv: onUndef,
    read: onUndef,
    rm: onUndef,
    stat: onUndef,
    touch: onUndef,
    write: onUndef
  },
  get: onUndef,
  id: onUndef,
  init: onUndef,
  isOnline: onUndef,
  key: {
    export: onUndef,
    gen: onUndef,
    import: onUndef,
    info: onUndef,
    list: onUndef,
    rename: onUndef,
    rm: onUndef
  },
  ls: onUndef,
  name: {
    publish: onUndef,
    pubsub: {
      cancel: onUndef,
      state: onUndef,
      subs: onUndef
    }
  },
  object: {
    data: onUndef,
    get: onUndef,
    links: onUndef,
    new: onUndef,
    patch: {
      addLink: onUndef,
      appendData: onUndef,
      rmLink: onUndef,
      setData: onUndef
    },
    put: onUndef,
    stat: onUndef
  },
  pin: onUndef,
  ping: onUndef,
  pubsub: {
    subscribe: onUndef,
    unsubscribe: onUndef,
    publish: onUndef,
    ls: onUndef,
    peers: onUndef
  },
  refs: onUndef,
  repo: {
    gc: onUndef,
    stat: onUndef,
    version: onUndef
  },
  resolve: onUndef,
  start: onUndef,
  stats: {
    bitswap: onUndef,
    bw: onUndef,
    repo: onUndef
  },
  stop: onUndef,
  swarm: {
    addrs: onUndef,
    connect: onUndef,
    disconnect: onUndef,
    localAddrs: onUndef,
    peers: onUndef
  },
  version: onUndef
})

module.exports = class ApiManager {
  constructor () {
    this.api = {
      ...defaultApi()
    }
  }

  update (nextApi, onUndef) {
    const prevApi = { ...this._api }
    const prevUndef = this._onUndef
    Object.keys(this.api).forEach(k => { delete this.api[k] })
    Object.assign(this.api, defaultApi(onUndef), nextApi)
    this._onUndef = onUndef || noop
    return { cancel: () => this.update(prevApi, prevUndef), api: this.api }
  }
}
