import IPFS from 'ipfs'

const plugin = {
  install(Vue, opts = {}) {
    Vue.prototype.$ipfs = IPFS.create(opts)
  },
}

// Auto-install
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
