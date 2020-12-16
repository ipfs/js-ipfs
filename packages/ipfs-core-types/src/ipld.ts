import { BlockService } from './block-service'
import CID from 'cids'
import { Await, AwaitIterable, AbortOptions } from './basic'
import { StoreReader, StoreExporter, StoreEraser } from './store'
import { ResolveResult, Format } from './ipld/format'

export interface IPLD<T = any> extends
  StoreReader<CID, T>,
  StoreExporter<CID, T>,
  StoreEraser<CID>

{
  put(value:T, format:FormatCode, options?:PutOptions & AbortOptions):Await<CID>
  putMany(values: AwaitIterable<T>, format: FormatCode, options?:PutOptions):AwaitIterable<CID>

  resolve(cid: CID, path: string, options?: AbortOptions): AwaitIterable<ResolveResult<T>>
  tree(cid:CID, path?:string, options?:TreeOptions & AbortOptions):AwaitIterable<string>

  addFormat(format:Format<T>):IPLD<T>
  removeFormat(format:Format<T>):IPLD<T>

  defaultOptions: Options
}

export type FormatCode = number
export type HashAlg = number

export interface Options {
  blockService?: BlockService
  formats?: Record<string, Format>

  loadFormat?: <T>(code:number|string) => Promise<Format<T>>
}

export interface PutOptions {
  hashAlg?: HashAlg,
  cidVersion?: 0|1,
  onlyHash?: boolean,

}

export interface TreeOptions {
  recursive?: boolean
}
