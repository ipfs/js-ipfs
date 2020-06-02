import CID from 'cids'
import { JSONValue, StringEncoded } from './data'

export type DAGNode = JSONValue

export type PutDAG = {
  dagNode: DAGNode
  format?: string
  hashAlg?: string
  cid?: StringEncoded<CID>
  pin?: boolean
  preload?: boolean
  timeout?: number
  signal?: AbortSignal
}

export type GetDAG = {
  cid: StringEncoded<CID>
  path: string
  localResolve: boolean
  timeout?: number
  signal?: AbortSignal
}

export type DAGEntry = {
  value: DAGNode
  remainderPath: string
}

export type EnumerateDAG = {
  cid: StringEncoded<CID>
  path: string
  recursive: boolean
  timeout?: number
  signal?: AbortSignal
}

export interface DAGAPI {
  put(input: PutDAG): Promise<StringEncoded<CID>>
  get(input: GetDAG): Promise<DAGEntry>
  tree(input: EnumerateDAG): Promise<string[]>
}
