import type { AbortOptions } from '../utils'
import type { KeyType } from '@libp2p/interfaces/keychain'

export interface API<OptionExtension = {}> {
  /**
   * Generate a new key
   *
   * @example
   * ```js
   * const key = await ipfs.key.gen('my-key', {
   *   type: 'rsa',
   *   size: 2048
   * })
   *
   * console.log(key)
   * // { id: 'QmYWqAFvLWb2G5A69JGXui2JJXzaHXiUEmQkQgor6kNNcJ',
   * //  name: 'my-key' }
   * ```
   */
  gen: (name: string, options?: GenOptions & OptionExtension) => Promise<Key>

  /**
   * List all the keys
   *
   * @example
   * ```js
   * const keys = await ipfs.key.list()
   *
   * console.log(keys)
   * // [
   * //   { id: 'QmTe4tuceM2sAmuZiFsJ9tmAopA8au71NabBDdpPYDjxAb',
   * //     name: 'self' },
   * //   { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
   * //     name: 'my-key' }
   * // ]
   * ```
   */
  list: (options?: AbortOptions & OptionExtension) => Promise<Key[]>

  /**
   * Remove a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.rm('my-key')
   *
   * console.log(key)
   * // { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
   * //   name: 'my-key' }
   * ```
   */
  rm: (name: string, options?: AbortOptions & OptionExtension) => Promise<Key>

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
   */
  rename: (oldName: string, newName: string, options?: AbortOptions & OptionExtension) => Promise<RenameKeyResult>

  /**
   * Remove a key
   *
   * @example
   * ```js
   * const pem = await ipfs.key.export('self', 'password')
   *
   * console.log(pem)
   * // -----BEGIN ENCRYPTED PRIVATE KEY-----
   * // MIIFDTA/BgkqhkiG9w0BBQ0wMjAaBgkqhkiG9w0BBQwwDQQIpdO40RVyBwACAWQw
   * // ...
   * // YA==
   * // -----END ENCRYPTED PRIVATE KEY-----
   * ```
   */
  export: (name: string, password: string, options?: AbortOptions & OptionExtension) => Promise<string>

  /**
   * Remove a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.import('clone', pem, 'password')
   *
   * console.log(key)
   * // { id: 'QmQRiays958UM7norGRQUG3tmrLq8pJdmJarwYSk2eLthQ',
   * //   name: 'clone' }
   * ```
   */
  import: (name: string, pem: string, password: string, options?: AbortOptions & OptionExtension) => Promise<Key>

  /**
   * Return the id and name of a key
   *
   * * @example
   * ```js
   * const { id, name } = await ipfs.key.info('key-name')
   * ```
   */
  info: (name: string, options?: AbortOptions & OptionExtension) => Promise<Key>
}

export interface GenOptions extends AbortOptions {
  type: KeyType
  size?: number
}

export interface Key {
  id: string
  name: string
}

export interface RenameKeyResult {
  id: string
  was: string
  now: string
  overwrite: boolean
}
