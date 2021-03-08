import type { AbortOptions, Await, AwaitIterable } from './basic'
import type { Block } from './block-service'
import type CID from 'cids'

export interface BlockStore {
  has: (cid: CID, options?: AbortOptions) => Await<boolean>
  get: (cid: CID, options?: AbortOptions) => Await<Block>
  put: (block: Block, options?: AbortOptions) => Await<Block>
  putMany: (blocks: AsyncIterable<Block>|Iterable<Block>, options?: AbortOptions) => AwaitIterable<Block>
}
