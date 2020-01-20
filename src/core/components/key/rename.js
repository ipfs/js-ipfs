'use strict'

// See https://github.com/ipfs/specs/tree/master/keystore

const callbackify = require('callbackify')

module.exports = function key (self) {
  return {
    gen: callbackify.variadic(async (name, opts) => { // eslint-disable-line require-await
      opts = opts || {}

      return self._keychain.createKey(name, opts.type, opts.size)
    }),

    info: callbackify(async (name) => { // eslint-disable-line require-await
      return self._keychain.findKeyByName(name)
    }),

    list: callbackify(async () => { // eslint-disable-line require-await
      return self._keychain.listKeys()
    }),

    rm: callbackify(async (name) => { // eslint-disable-line require-await
      return self._keychain.removeKey(name)
    }),

    rename: callbackify(async (oldName, newName) => {
      const key = await self._keychain.renameKey(oldName, newName)

      return {
        was: oldName,
        now: key.name,
        id: key.id,
        overwrite: false
      }
    }),

    import: callbackify(async (name, pem, password) => { // eslint-disable-line require-await
      return self._keychain.importKey(name, pem, password)
    }),

    export: callbackify(async (name, password) => { // eslint-disable-line require-await
      return self._keychain.exportKey(name, password)
    })
  }
}
