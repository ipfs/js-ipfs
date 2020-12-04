import { Block, CID, Await, AbortOptions } from './basic'
import { StoreReader, StoreImporter, StoreExporter, StoreEraser } from './store'
import { Bitswap } from './bitswap'

export interface BlockService extends
  StoreReader<CID, Block>,
  StoreExporter<CID, Block>,
  StoreImporter<Block>,
  StoreEraser<CID>
{
  setExchange(bitswap: Bitswap): void

  unsetExchange(): void
  hasExchange(): boolean

  /**
   * Put a block to the underlying datastore.
   */
  put(block: Block, options?:AbortOptions): Await<Block>
}
