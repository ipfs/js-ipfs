'use strict'

// See https://github.com/ipfs/specs/tree/master/keystore

const promisify = require('promisify-es6')

function toKeyInfo (key) {
  return {
    Name: key.name,
    Id: key.id
  }
}

module.exports = function key (self) {
  return {
    gen: promisify((name, opts, callback) => {
      self._keychain.createKey(name, opts.type, opts.size, (err, key) => {
        if (err) return callback(err)
        callback(null, toKeyInfo(key))
      })
    }),

    info: promisify((name, callback) => {
      self._keychain.findKeyByName(name, (err, key) => {
        if (err) return callback(err)
        callback(null, toKeyInfo(key))
      })
    }),

    list: promisify((callback) => {
      self._keychain.listKeys((err, keys) => {
        if (err) return callback(err)
        keys = keys.map(toKeyInfo)
        callback(null, { Keys: keys })
      })
    }),

    rm: promisify((name, callback) => {
      self._keychain.removeKey(name, callback)
    }),

    rename: promisify((oldName, newName, callback) => {
      self._keychain.renameKey(oldName, newName, (err, key) => {
        if (err) return callback(err)
        const result = {
          Was: oldName,
          Now: key.name,
          Id: key.id,
          Overwrite: false
        }
        callback(null, result)
      })
    })
  }
}
