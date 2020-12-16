import BigInteger from 'bignumber.js'
import PeerId from 'peer-id'
import CID from 'cids'
import { Block } from './block-service'
import { AbortOptions, Await } from './basic'
import { MovingAverage } from './bitswap/moving-avarage'
import { StoreReader, StoreExporter, StoreImporter } from './store'

export interface Bitswap extends
  StoreReader<CID, Block>,
  StoreExporter<CID, Block>,
  StoreImporter<Block>
{

  readonly peerId: PeerId

  enableStats(): void
  disableStats(): void

  wantlistForPeer(peerId: PeerId, options?:AbortOptions): Map<string, WantListEntry>
  ledgerForPeer(peerId: PeerId): Ledger

  put(block: Block, options?: AbortOptions): Await<void>

  unwant(cids: Iterable<CID>, options?: AbortOptions): void
  cancelWants(cids: Iterable<CID>): void
  getWantlist(options?: AbortOptions): Iterable<[string, WantListEntry]>
  peers(): PeerId[]
  stat(): Stats
  start(): void
  stop(): void
}

export interface Ledger {
  sentBytes(n:number):void
  receivedBytes(n:number):void

  wants(cid: CID, priority: number, wantType: WantType):void
  cancelWant(cid: CID): void
  wantlistContains(cid:CID): WantListEntry|void

  debtRatio():number
}

export interface WantListEntry {
  readonly cid: CID
  priority: number
  inc(): void
  dec(): void
  hasRefs(): boolean
  equals(other: WantListEntry): boolean
}

export type WantList = {
  entries: Entry[]
  full?: boolean
}

export type Entry = {
  block: Uint8Array
  priority: number
  cancel: boolean
  wantType?: WantType
  sendDontHave?: boolean
}

export type BlockPresence = {
  cid: Uint8Array
  type: BlockPresenceType
}

export type Have = 0
export type DontHave = 1
export type BlockPresenceType = Have | DontHave

export type WantBlock = 0
export type HaveBlock = 1
export type WantType = WantBlock | HaveBlock

export type BlockData = {
  prefix: Uint8Array
  data: Uint8Array
}

export interface Stats {
  enable(): void
  disable(): void
  stop(): void
  readonly snapshot: Record<string, BigInteger>
  readonly movingAverages: Record<string, Record<number, MovingAverage>>
  push(counter: number, inc: number): void
}
