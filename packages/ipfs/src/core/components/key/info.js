'use strict'

module.exports = ({ keychain }) => {
  return name => keychain.findByName(name)
}
