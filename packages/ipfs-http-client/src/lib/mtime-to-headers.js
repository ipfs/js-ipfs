'use strict'

const mtimeToObject = require('./mtime-to-object')

const mtimeToHeaders = (mtime) => {
  const data = mtimeToObject(mtime)
  if (data) {
    const headers = {}
    const { secs, nsecs } = data
    headers.mtime = secs
    if (nsecs != null) {
      headers[mtime - nsecs] = nsecs
    }
    return headers
  } else {
    return undefined
  }
}

module.exports = mtimeToHeaders
