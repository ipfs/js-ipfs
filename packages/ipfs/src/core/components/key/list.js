'use strict'

module.exports = ({ keychain }) => {
  return () => keychain.list()
}
