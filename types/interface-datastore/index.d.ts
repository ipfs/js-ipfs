import { ErrorCode } from "err-code"
import { Buffer } from "buffer"

export type StoreOptions = {
  signal?:AbortSignal
}

export type StoreEntry<Key, Value> = {
  key:Key,
  value:Value
}

export type Many<T> = Iterable<T>|AsyncIterable<T>

export interface StoreQuery<Key, Value> {
  prefix?:string,
  filters?:Array<(input:Value) => boolean>,
  orders?:Array<(input:Value[]) => Value[]>,
  limit?:number,
  offset?:number,
}

export interface EntriesQuery<Key, Value> extends StoreQuery<Key, Value> {
  keysOnly?:void
}

export interface KeysQuery<Key, Value> extends StoreQuery<Key, Value> {
  keysOnly:true
}

export interface StoreBatch<Key, Value> {
  put(key:Key, value:Value, options?:StoreOptions):void,
  delete(key:Key, options?:StoreOptions):void,
  commit():Promise<void>
}

export interface Store<K, V> {
  has(key:K, options?:StoreOptions):Promise<boolean>
  put(key:K, value:V, options?:StoreOptions):Promise<void>
  putMany(source:Many<StoreEntry<K, V>>, options?:StoreOptions):AsyncIterable<StoreEntry<K, V>>
  get(key:K, options?:StoreOptions):Promise<V>
  getMany(source:Many<K>, options?:StoreOptions):AsyncIterable<V>
  delete(key:K, options?:StoreOptions):Promise<void>
  deleteMany(source:Many<K>, options?:StoreOptions):AsyncIterable<K>
  query(query:EntriesQuery<K, V>, options?:StoreOptions):AsyncIterable<StoreEntry<K, V>>
  query(query:KeysQuery<K, V>, options?:StoreOptions):AsyncIterable<{key:Key}>
  batch():StoreBatch<K, V>

  open():Promise<void>
  close():Promise<void>
}

export declare class Adapter<K, V> implements Store<K, V> {
  open():Promise<void>
  close():Promise<void>

  has(key:K, options?:StoreOptions):Promise<boolean>
  put(key:K, value:V, options?:StoreOptions):Promise<void>
  putMany(source:Many<StoreEntry<K, V>>, options?:StoreOptions):AsyncIterable<StoreEntry<K, V>>
  get(key:K, options?:StoreOptions):Promise<V>
  getMany(source:Many<K>, options?:StoreOptions):AsyncIterable<V>
  delete(key:K, options?:StoreOptions):Promise<void>
  deleteMany(source:Many<K>, options?:StoreOptions):AsyncIterable<K>
  query(query:EntriesQuery<K, V>, options?:StoreOptions):AsyncIterable<StoreEntry<K, V>>
  query(query:KeysQuery<K, V>, options?:StoreOptions):AsyncIterable<{key:Key}>
  batch():StoreBatch<K, V>
}

export class MemoryDatastore extends Adapter<Key, Buffer> implements Store<Key, Buffer> {
  constructor();
}

export declare class Key {
  static isKey(obj: any): boolean;

  static random(): Key;

  static withNamespaces(list:string[]): Key;

  constructor(input:string|Buffer, _?:boolean)
  toString():string
  toBuffer():Buffer
  clean():void
  less(key:Key):boolean
}

export namespace Errors {
  function dbDeleteFailedError(err?: Error): ErrorCode<'ERR_DB_DELETE_FAILED'>;
  function dbOpenFailedError(err?: Error): ErrorCode<'ERR_DB_OPEN_FAILED'>;
  function dbWriteFailedError(err?: Error): ErrorCode<'ERR_DB_WRITE_FAILED'>;
  function notFoundError(err?: Error): ErrorCode<'ERR_NOT_FOUND'>;
  function abortedError(err?:Error): ErrorCode<'ERR_ABORTED'>;
}



export namespace utils {
  function filter(iterable: any, filterer: any): any;
  function map(iterable: any, mapper: any): any;
  function replaceStartWith(s: any, r: any): any;
  function sortAll(iterable: any, sorter: any): any;
  function take(iterable: any, n: any): any;
  function tmpdir(transform: any): any;
}

