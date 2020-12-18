'use strict'

const peekable = require('it-peekable')
const map = require('it-map')
const { callbackify } = require('util')

module.exports = function grpcMfsWrite (ipfs, options = {}) {
  async function mfsWrite (source, metadata) {
    const opts = {
      ...metadata
    }

    if (opts.mtime) {
      opts.mtime = {
        secs: opts.mtime,
        nsecs: opts.mtimeNsecs
      }
    }

    // path is sent with content messages
    const content = peekable(source)
    const result = await content.peek()
    const {
      value: {
        // @ts-ignore
        path
      }
    } = result
    content.push(result.value)

    // @ts-ignore
    await ipfs.files.write(path, map(content, ({ content }) => content), opts)

    return {}
  }

  return callbackify(mfsWrite)
}
