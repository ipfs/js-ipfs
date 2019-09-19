'use strict'

const { URL } = require('iso-url')
const nodeify = require('promise-nodeify')
const { default: ky } = require('ky-universal')

module.exports = (ipfs) => {
  const addFromURL = async (url, opts) => {
    opts = opts || {}
    const res = await ky.get(url)
    const path = decodeURIComponent(new URL(res.url).pathname.split('/').pop())
    const content = Buffer.from(await res.arrayBuffer())
    return ipfs.add({ content, path }, opts)
  }

  return (name, opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    return nodeify(addFromURL(name, opts), cb)
  }
}
