'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption(async (oldName, newName, options) => {
    const key = await keychain.renameKey(oldName, newName, options)
    return {
      was: oldName,
      now: key.name,
      id: key.id,
      overwrite: false
    }
  })
}
