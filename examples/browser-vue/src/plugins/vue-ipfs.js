import IPFS from 'ipfs'

function promisifyIpfs(opts) {
  return new Promise((resolve, reject) => {
    const node = new IPFS(opts)
    node.once('ready', () => resolve(node))
    node.once('error', err => reject(err))
  })
}

const plugin = {
  install(Vue, opts = {}) {
    Vue.prototype.$ipfs = promisifyIpfs(opts)
  },
}

// Auto-install
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
