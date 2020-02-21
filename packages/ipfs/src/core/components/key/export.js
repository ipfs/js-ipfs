'use strict'

module.exports = ({ keychain }) => {
  return (name, password) => keychain.exportKey(name, password)
}
