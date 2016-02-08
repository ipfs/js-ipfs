'use strict'

module.exports = (send) => {
  return function id (idParam, cb) {
    if (typeof idParam === 'function') {
      cb = idParam
      idParam = null
    }
    return send('id', idParam, null, null, cb)
  }
}
