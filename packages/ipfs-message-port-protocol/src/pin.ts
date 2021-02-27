import * as Pin from 'ipfs-core-types/src/pin'
import type { PinEntry, PinSource, PinType, PinQueryType } from 'ipfs-core-types/src/pin'
import type { TransferOptions, QueryOptions } from './rpc'
import type { EncodedCID, CID } from './cid'
import type { RemoteIterable } from './core'

export interface API {
  add: (source: CID | string, options?: AddOptions) => Promise<CID>
  // addAll: (source: PinSource, options?: AddAllOptions) => AsyncIterable<CID>
  rm: (source: CID | string, options?: RemoveOptions) => Promise<CID>
  rmAll: (source: PinSource, options?: RemoveAllOptions) => AsyncIterable<CID>
  ls: (options?: ListOptions) => AsyncIterable<PinEntry>
}

export interface AddOptions extends Pin.AddOptions, TransferOptions {}
export interface AddAllOptions extends Pin.AddAllOptions, TransferOptions { }
export interface RemoveOptions extends Pin.RemoveOptions, TransferOptions {}
export interface RemoveAllOptions extends Pin.RemoveAllOptions, TransferOptions {}
export interface ListOptions extends Pin.ListOptions, TransferOptions {}

export interface EncodedPin {
  type: 'Pin'
  path: string|EncodedCID
  cid?: undefined
  recursive?: boolean
  metadata?: any
}

export type EncodedPinSource = EncodedPin | RemoteIterable<EncodedPin>

export interface EncodedPinEntry {
  cid: EncodedCID
  type: PinType
  metadata?: any
}

export interface AddQuery extends QueryOptions {
  path: string|EncodedCID
  recursive?: boolean
  matadata?: any
}

export interface AddResult {
  cid: EncodedCID
  transfer: Transferable[]
}

export interface ListQuery extends QueryOptions {
  paths?: Array<EncodedCID|string>

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

export type { PinEntry, PinSource, EncodedCID, PinType, PinQueryType }
