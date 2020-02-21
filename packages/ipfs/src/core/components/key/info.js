'use strict'

module.exports = ({ keychain }) => {
  return name => keychain.findKeyByName(name)
}
