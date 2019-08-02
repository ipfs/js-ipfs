'use strict'

const { URL } = require('iso-url')
const nodeify = require('promise-nodeify')
const { isElectronRenderer } = require('ipfs-utils/src/env')
if (isElectronRenderer) {
  // `fetch` needs to be polyfilled before importing ky-universal:
  // ky-universal won't use node-fetch because electron-renderer already has global.fetch defined
  // and we can't use the one from electron-renderer as it returns different
  // errors and makes HTTPS mocking impossible in tests
  // TODO: remove when upstream fix lands
  global.fetch = require('node-fetch')
}
const { default: ky } = require('ky-universal')

module.exports = (ipfs) => {
  const addFromURL = async (url, opts = {}) => {
    const res = await ky.get(url)
    const path = decodeURIComponent(new URL(res.url).pathname.split('/').pop())
    const content = Buffer.from(await res.arrayBuffer())
    return ipfs.add({ content, path }, opts)
  }

  return (name, opts = {}, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    return nodeify(addFromURL(name, opts), cb)
  }
}
