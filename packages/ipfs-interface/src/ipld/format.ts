
import CID from 'cids'
import { Await } from '../basic'

export interface Format <T=any> {
  util: Util<T>
  resolver: Resolver<T>

  defaultHashArg: string | number
  codec: string | number
}

export interface Util<T> {
  /**
   * Serialize an IPLD Node into a binary blob.
   */
  serialize(node:T):Uint8Array
  /**
   * Deserialize a binary blob into an IPLD Node.
   */
  deserialize(bytes: Uint8Array): T

  /**
   * Calculate the CID of the binary blob.
   */
  cid(bytes:Uint8Array, options?:CIDOptions): Await<CID>
}

export interface CIDOptions {
  cidVersion?: number
  hashAlg?: number | string
}

export interface Resolver<T> {
  resolve(bytes: Uint8Array, path: string): ResolveResult<T>
  tree(byte: Uint8Array): string[]
}

export interface ResolveResult<T> {
  value: T
  remainderPath: string
}
