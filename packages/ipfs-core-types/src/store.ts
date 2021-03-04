
import type { Await, AwaitIterable, AbortOptions } from './basic'

export interface ValueStore<T> {
  get: (options?: AbortOptions) => Await<T>
  set: (value: T) => Await<void>
}

export interface KeyValueStore<Key, Value, Entry> extends
  StoreReader<Key, Value>,
  StoreExporter<Key, Value>,
  StoreSelector<Entry>,
  StoreLookup<Key>,
  StoreWriter<Key, Value>,
  StoreImporter<Entry>,
  StoreEraser<Key> {
}

// Interface Datastore

export interface StoreReader<Key, Value> {
  /**
   * The key retrieve the value for.
   */
  get: (key: Key, options?: AbortOptions) => Await<Value>
}

export interface StoreLookup<Key> {
  /**
   * Check for the existence of a given key
   */
  has: (key: Key, options?: AbortOptions) => Await<boolean>
}

export interface StoreExporter<Key, Value> {
  /**
   * Retrieve a stream of values stored under the given keys.
   */
  getMany: (keys: AwaitIterable<Key>, options?: AbortOptions) => AwaitIterable<Value>
}

export interface StoreSelector<Entry> {
  /**
   * Search the store for some values.
   */
  query: (query: Query<Entry>, options?: AbortOptions) => AwaitIterable<Entry>
}

export interface StoreWriter<Key, Value> {
  /**
   * Store a value with the given key.
   */
  put: (key: Key, value: Value, options?: AbortOptions) => Await<void>
}

export interface StoreImporter<Entry> {
  /**
   * Store many key-value pairs.
   */
  putMany: (entries: AwaitIterable<Entry>, options?: AbortOptions) => AwaitIterable<Entry>
}

export interface StoreEraser<Key> {
  /**
   * Delete the content stored under the given key.
   */
  delete: (key: Key, options?: AbortOptions) => Await<void>
  /**
   * Delete the content stored under the given keys.
   */
  deleteMany: (keys: AwaitIterable<Key>, options?: AbortOptions) => AwaitIterable<Key>

}
export interface StoreBatch<Key, Value> {
  batch: () => Batch<Key, Value>
}

export interface Batch<Key, Value> {
  put: (key: Key, value: Value) => void
  delete: (key: Key) => void

  commit: (options?: AbortOptions) => Await<void>
}

export interface Resource {
  /**
   * Opens the datastore, this is only needed if the store was closed before,
   * otherwise this is taken care of by the constructor.
   */
  open: () => Await<void>
  /**
   * Close the datastore, this should always be called to ensure resources
   * are cleaned up.
   */
  close: () => Await<void>
}

export interface Query<Entry, Options = any> {
  /**
   * Only return values where the key starts with this prefix
   */
  prefix?: string
  /**
   * Filter the results according to the these functions
   */
  filters?: Array<(resut: Entry) => boolean>
  /**
   * Order the results according to these functions
   */
  orders?: Array<(results: Entry[]) => Entry[]>
  /**
   * Only return this many records
   */
  limit?: number
  /**
   * An options object, all properties are optional
   */
  options?: Options
  /**
   * A way to signal that the caller is no longer interested in the outcome of
   * this operation
   */
  signal?: AbortSignal
}
