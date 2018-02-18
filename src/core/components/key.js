'use strict'

// See https://github.com/ipfs/specs/tree/master/keystore

const promisify = require('promisify-es6')

module.exports = function key (self) {
  return {
    gen: promisify((name, opts, callback) => {
      self._keychain.createKey(name, opts.type, opts.size, callback)
    }),

    info: promisify((name, callback) => {
      self._keychain.findKeyByName(name, callback)
    }),

    list: promisify((callback) => {
      self._keychain.listKeys(callback)
    }),

    rm: promisify((name, callback) => {
      self._keychain.removeKey(name, callback)
    }),

    rename: promisify((oldName, newName, callback) => {
      self._keychain.renameKey(oldName, newName, (err, key) => {
        if (err) return callback(err)
        const result = {
          was: oldName,
          now: key.name,
          id: key.id,
          overwrite: false
        }
        callback(null, result)
      })
    }),

    import: promisify((name, pem, password, callback) => {
      self._keychain.importKey(name, pem, password, callback)
    }),

    export: promisify((name, password, callback) => {
      self._keychain.exportKey(name, password, callback)
    })
  }
}
