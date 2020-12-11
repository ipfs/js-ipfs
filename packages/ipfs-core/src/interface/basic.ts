import CID from 'cids'
import PeerId from 'peer-id'
import BigInteger from 'bignumber.js'
export type Await<T> =
  | T
  | Promise<T>

export type AwaitIterable<T> =
  | Iterable<T>
  | AsyncIterable<T>

export interface AbortOptions {
  signal?: AbortSignal
}
export type ToJSON =
  | null
  | string
  | number
  | boolean
  | ToJSON[]
  | { toJSON?: () => ToJSON } & {[key:string]: ToJSON}

export interface Block {
  cid: CID
  data: Uint8Array
}

export type { CID, PeerId, BigInteger }
