'use strict'

module.exports = ({ keychain }) => {
  return (name, pem, password) => keychain.importKey(name, pem, password)
}
