import { KeyValueStore, StoreBatch, StoreSelector, Resource } from './store'
export interface DataStore extends
  KeyValueStore<Key, Value, Entry>,
  StoreSelector<Entry>,
  StoreBatch<Key, Value>,
  Resource
{
}

export interface Key {
  /**
   * Returns the "name" of this key (field of last namespace).
   *
   * @example
   * ```js
   * key.toString()
   * // '/Comedy/MontyPython/Actor:JohnCleese'
   * key.name()
   * // 'JohnCleese'
   * ```
   */
  name(): string

  /**
   * Returns the "type" of this key (value of last namespace).
   *
   * @example
   * ```js
   * key.toString()
   * '/Comedy/MontyPython/Actor:JohnCleese'
   * key.type()
   * // 'Actor'
   * ```
   */
  type(): string

  /**
   * Returns the `namespaces` making up this `Key`.
   */
  namespaces(): string[]

  /**
   * Returns the "base" namespace of this key.
   *
   * @example
   * ```js
   * key.toString()
   * // '/Comedy/MontyPython/Actor:JohnCleese'
   * key.baseNamespace()
   * // 'Actor:JohnCleese'
   */
  baseNamespace(): string

  /**
   * Returns an "instance" of this type key (appends value to namespace).
   *
   * @example
   * ```js
   * key.toString()
   * // '/Comedy/MontyPython/Actor'
   * key.instance('JohnClesse').toString()
   * // '/Comedy/MontyPython/Actor:JohnCleese'
   * ```
   */
  instance(): Key

  /**
   * Returns the "path" of this key (parent + type).
   *
   * @example
   * ```js
   * key.toString()
   * '/Comedy/MontyPython/Actor:JohnCleese'
   * key.path().toString()
   * // '/Comedy/MontyPython/Actor'
   * ```
   */
  path(): Key

  /**
   * Returns the `parent` Key of this Key.
   *
   * @example
   * ```js
   * key.toString()
   * "/Comedy/MontyPython/Actor:JohnCleese"
   * key.parent().toString()
   * // "/Comedy/MontyPython"
   * ```
   */
  parent(): Key

  /**
   * Returns the `child` Key of this Key.
   *
   * @example
   * ```js
   * key.toString()
   * '/Comedy/MontyPython'
   * child.toString()
   * // 'Actor:JohnCleese'
   * key.child(child).toString()
   * '/Comedy/MontyPython/Actor:JohnCleese'
   * ```
   */
  child(key: Key): Key

  /**
   * Check if the given key is sorted lower than this.
   */
  less(key: Key): boolean

  /**
   * Returns whether this key is a prefix of `other`
   *
   * @example
   * ```js
   * comedy.toString()
   * '/Comedy'
   * monty.toString()
   * '/Comedy/MontyPython'
   * comedy.isAncestorOf(monty)
   * // true
   * ```
   */
  isAncestorOf(other: Key): boolean

  /**
   * Returns whether this key is a contains `other` as prefix.
   * ```js
   * comedy.toString()
   * '/Comedy'
   * monty.toString()
   * '/Comedy/MontyPython'
   * monty.isDecendantOf(comedy)
   * // true
   * ```
   */
  isDecendantOf(other: Key): boolean

  /**
   * Returns wether this key has only one namespace.
   */
  isTopLevel(): boolean

  /**
   * Returns the key with all parts in reversed order.
   *
   * @example
   * ```js
   * key.toString()
   * // '/Comedy/MontyPython/Actor:JohnCleese'
   * key.reverse().toString()
   * // /Actor:JohnCleese/MontyPython/Comedy
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').reverse()
   * ```
   */
  reverse(): Key

  /**
   * Concats one or more Keys into one new Key.
   */
  concat(...keys: Key[]): Key

  /**
   * Returns the array representation of this key.
   *
   * @example
   * ```js
   * key.toString()
   * // '/Comedy/MontyPython/Actor:JohnCleese'
   * key.list()
   * // ['Comedy', 'MontyPythong', 'Actor:JohnCleese']
   * ```
   */
  list(): string[]
  toString(): string
}

export type Value = Uint8Array

export interface Entry {
  key: Key,
  value: Value
}
