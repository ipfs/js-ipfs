import CID from 'cids'
import { Block } from './block-service'
import { ToJSON, Await, AbortOptions } from './basic'
import { DataStore, Key } from './datastore'
import {
  ValueStore, StoreReader, Resource, StoreLookup,
  StoreImporter, StoreExporter, StoreEraser, StoreSelector,
  KeyValueStore
} from './store'

export interface Repo<Config extends ToJSON = any> extends Resource {
  readonly path: string
  closed: boolean

  /**
   * Initializes necessary structures inside the repo
   */
  init(config:Partial<Config>):Await<void>

  /**
   * Tells whether this repo exists or not.
   */
  exists():Await<boolean>

  /**
   * Tells whether the repo has been initialized.
   */
  isInitialized():Await<boolean>

  /**
   * Gets the repo status.
   */
  stat(options?:AbortOptions):Await<RepoStatus>

  root: KeyValueStore<Key|string|Uint8Array, Uint8Array, { key: Key, value: Uint8Array }>

  blocks: BlockStore
  datastore: DataStore

  pins: PinStore
  config: ConfigStore<Config>
  keys: KeyStore

  version: ValueStore<number>
  apiAddr: ValueStore<string>
}

export interface RepoStatus {
  numObjects: number
  repoPath: string
  repoSize: number
  version: number
  storageMax: number
}

interface BlockStore extends
  StoreImporter<Block>,
  StoreReader<CID, Block>,
  StoreLookup<CID>,
  StoreExporter<CID, Block>,
  StoreEraser<CID>,
  StoreSelector<Block>
{
  put(block: Block): Await<Block>
}

export interface ConfigStore<Config extends ToJSON = any> extends
  StoreReader<string, ToJSON>
{
  /**
   * Set a config `value`, where `value` can be anything that is serializable
   * to JSON.
   */
  set(key: string, value: ToJSON, options?:AbortOptions): Await<void>

  /**
   * Set the whole `config` which can be a any value that is serializable to
   * JSON.
   *
   * @param config
   */
  replace(config: Config, options?: AbortOptions): Await<void>

  /**
   * Get the entire config value.
   */
  getAll(options?:AbortOptions): Await<Config>

  /**
   * Whether the config sub-repo exists.
   */
  exists(): Await<boolean>
}

export interface PinStore extends
  KeyValueStore<string, Uint8Array, { key: string, value: Uint8Array }>,
  Object
{
}

export interface KeyStore extends
  KeyValueStore<Key, Uint8Array, { key: Key, value: Uint8Array }>,
  Object
{

}
