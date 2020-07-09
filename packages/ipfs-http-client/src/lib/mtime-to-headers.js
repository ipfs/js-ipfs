// @ts-check
'use strict'

const mtimeToObject = require('./mtime-to-object')

/**
 * @typedef {import('./mtime-to-object').MTime} MTime
 * @typedef {Object} MTimeHeaders
 * @property {number} [mtime]
 * @property {number} [nsecs]
 */

/**
 * @param {null|undefined|MTime} mtime
 * @returns {void|MTimeHeaders}
 */
const mtimeToHeaders = (mtime) => {
  const data = mtimeToObject(mtime)
  if (data) {
    const { secs, nsecs } = data
    const headers = { mtime: secs }
    if (nsecs != null) {
      headers['mtime-nsecs'] = nsecs
    }
    return headers
  } else {
    return undefined
  }
}

module.exports = mtimeToHeaders
