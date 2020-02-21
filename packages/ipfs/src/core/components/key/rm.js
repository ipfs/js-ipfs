'use strict'

module.exports = ({ keychain }) => {
  return name => keychain.removeKey(name)
}
