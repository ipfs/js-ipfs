'use strict'
/* eslint-env browser */

/**
 * @param {Uint8Array} buf
 */
module.exports = buf => {
  const formData = new FormData()
  formData.append('file', new Blob([buf], { type: 'application/octet-stream' }))
  return formData
}
