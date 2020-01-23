'use strict'

module.exports = ({ keychain }) => {
  return (name, options) => {
    options = options || {}
    return keychain.createKey(name, options.type, options.size)
  }
}
