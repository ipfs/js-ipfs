'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * Rename a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.rename('my-key', 'my-new-key')
   *
   * console.log(key)
   * // { id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg',
   * //   was: 'my-key',
   * //   now: 'my-new-key',
   * //   overwrite: false }
   * ```
   * @param {string} oldName - The current key name
   * @param {string} newName - The desired key name
   * @returns {Promise<RenamedKey>}
   */
  const rename = async (oldName, newName) => {
    const key = await keychain.renameKey(oldName, newName)

    return {
      was: oldName,
      now: key.name,
      id: key.id,
      overwrite: false
    }
  }

  return withTimeoutOption(rename)
}

/**
 * @typedef {Object} RenamedKey
 * @property {string} was - The name of the key
 * @property {string} now -  The hash of the key
 * @property {string} id
 * @property {boolean} overwrite
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
