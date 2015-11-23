'use strict'

module.exports = send => {
  return function id (id, cb) {
    if (typeof id === 'function') {
      cb = id
      id = null
    }
    return send('id', id, null, null, cb)
  }
}
