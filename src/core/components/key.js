'use strict'

// See https://github.com/ipfs/specs/tree/master/keystore

const promisify = require('promisify-es6')

module.exports = function key (self) {
  return {
    generate: promisify((name, type, size, callback) => {
      self._keychain.createKey(name, type, size, callback)
    }),

    info: promisify((name, callback) => {
      self._keychain.findKeyByName(name, callback)
    }),

    list: promisify((callback) => {
      self._keychain.listKeys(callback)
    }),

    remove: promisify((name, callback) => {
      self._keychain.removeKey(name, callback)
    }),

    rename: promisify((oldName, newName, callback) => {
      self._keychain.renameKey(oldName, newName, callback)
    })
  }
}
