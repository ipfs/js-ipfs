
import Block from 'ipld-block'
import CID from 'cids'
import Bitswap from 'ipfs-bitswap'

declare class BlockService {
  constructor (ipfsRepo: any)
  setExchange (bitswap: Bitswap): void
  unsetExchange (): void
  hasExchange (): boolean
  put (block: Block): Promise<void>
  putMany (blocks: Block[]): Promise<void>
  get(cid: CID): Promise<Block>
  getMany(cids: CID[]): Iterator<Block>
  delete(cid: CID): Promise<void>
}

export=BlockService
