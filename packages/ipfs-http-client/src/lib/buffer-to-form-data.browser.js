'use strict'
/* eslint-env browser */

module.exports = buf => {
  const formData = new FormData()
  formData.append('file', new Blob([buf], { type: 'application/octet-stream' }))
  return formData
}
