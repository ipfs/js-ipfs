'use strict'

function fail () {
  throw new Error('Key management is not yet implemented')
}

class NoKeychain {
  static get options () { return {} }

  createKey () { fail() }
  listKeys () { fail() }
  findKeyById () { fail() }
  findKeyByName () { fail() }
  renameKey () { fail() }
  exportKey () { fail() }
  importKey () { fail() }
  importPeer () { fail() }

  get cms () { fail() }
}

module.exports = NoKeychain
