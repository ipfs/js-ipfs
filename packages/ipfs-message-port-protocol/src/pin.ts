import type * as Pin from 'ipfs-core-types/src/pin'
import type { TransferOptions, QueryOptions } from './rpc'
import type { EncodedCID } from './cid'
import type CID from 'cids'
import type { RemoteIterable } from './core'

export type LsResult = Pin.LsResult
export type PinSource = Pin.PinSource
export type PinType = Pin.PinType
export type PinQueryType = Pin.PinQueryType
export interface API {
  add: (source: CID | string, options?: AddOptions) => Promise<CID>
  // addAll: (source: PinSource, options?: AddAllOptions) => AsyncIterable<CID>
  rm: (source: CID | string, options?: RemoveOptions) => Promise<CID>
  rmAll: (source: PinSource, options?: RemoveAllOptions) => AsyncIterable<CID>
  ls: (options?: ListOptions) => AsyncIterable<LsResult>
}

export interface AddOptions extends Pin.AddOptions, TransferOptions { }
export interface AddAllOptions extends Pin.AddAllOptions, TransferOptions { }
export interface RemoveOptions extends Pin.RmOptions, TransferOptions { }
export interface RemoveAllOptions extends Pin.RmOptions, TransferOptions { }
export interface ListOptions extends Pin.LsOptions, TransferOptions { }

export interface EncodedPin {
  type: 'Pin'
  path: string
  cid?: undefined
  recursive?: boolean
  metadata?: any
}

export type EncodedPinSource = RemoteIterable<EncodedPin>

export interface EncodedPinEntry {
  cid: EncodedCID
  type: PinType
  metadata?: any
}

export interface AddQuery extends QueryOptions {
  path: string | EncodedCID
  recursive?: boolean
  matadata?: any
}

export interface AddResult {
  cid: EncodedCID
  transfer: Transferable[]
}

export interface ListQuery extends QueryOptions {
  paths?: Array<EncodedCID | string>

}

export interface ListResult {
  data: RemoteIterable<EncodedPinEntry>
  transfer: Transferable[]
}

export interface RemoveAllQuery extends QueryOptions {
  source: EncodedPinSource
  recursive?: boolean
}

export interface RemoveResult {
  cid: EncodedCID
  transfer: Transferable[]
}

export interface RemoveQuery extends QueryOptions {
  source: EncodedCID | string
  recursive?: boolean
}

export interface RemoveAllResult {
  data: RemoteIterable<EncodedCID>
  transfer: Transferable[]
}

export interface Service {
  add: (query: AddQuery) => Promise<AddResult>
  ls: (query: ListQuery) => ListResult

  rm: (query: RemoveQuery) => Promise<RemoveResult>
  rmAll: (query: RemoveAllQuery) => RemoveAllResult
}
