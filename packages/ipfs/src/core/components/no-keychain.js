'use strict'

function fail () {
  throw new Error('Key management requires \'--pass ...\' option')
}

class NoKeychain {
  static get options () { fail() }

  static generateOptions () { fail() }

  createKey () { fail() }

  listKeys () { fail() }

  findKeyById () { fail() }

  findKeyByName () { fail() }

  renameKey () { fail() }

  removeKey () { fail() }

  exportKey () { fail() }

  importKey () { fail() }

  importPeer () { fail() }

  get cms () { fail() }
}

module.exports = NoKeychain
