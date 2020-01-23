'use strict'

module.exports = ({ keychain }) => {
  return async (oldName, newName) => {
    const key = await keychain.renameKey(oldName, newName)
    return {
      was: oldName,
      now: key.name,
      id: key.id,
      overwrite: false
    }
  }
}
