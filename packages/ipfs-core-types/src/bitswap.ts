import type BigInteger from 'bignumber.js'
import type PeerId from 'peer-id'
import type CID from 'cids'
import type { Block } from './block-service'
import type { AbortOptions, Await } from './basic'
import type { MovingAverage } from './bitswap/moving-avarage'
import type { StoreReader, StoreExporter, StoreImporter } from './store'

export interface Bitswap extends
  StoreReader<CID, Block>,
  StoreExporter<CID, Block>,
  StoreImporter<Block> {

  readonly peerId: PeerId

  enableStats: () => void
  disableStats: () => void

  wantlistForPeer: (peerId: PeerId, options?: AbortOptions) => Map<string, WantListEntry>
  ledgerForPeer: (peerId: PeerId) => null|LedgerForPeer

  put: (block: Block, options?: AbortOptions) => Await<void>

  unwant: (cids: CID|CID[], options?: AbortOptions) => void
  cancelWants: (cids: CID|CID[]) => void
  getWantlist: (options?: AbortOptions) => Iterable<[string, WantListEntry]>
  peers: () => PeerId[]
  stat: () => Stats
  start: () => void
  stop: () => void
}

export interface LedgerForPeer {
  peer: string
  value: number
  sent: number
  recv: number
  exchanged: number
}

export interface Ledger {
  sentBytes: (n: number) => void
  receivedBytes: (n: number) => void

  wants: (cid: CID, priority: number, wantType: WantType) => void
  cancelWant: (cid: CID) => void
  wantlistContains: (cid: CID) => WantListEntry|undefined

  debtRatio: () => number
}

export interface WantListEntry {
  readonly cid: CID
  priority: number
  inc: () => void
  dec: () => void
  hasRefs: () => boolean
  equals: (other: WantListEntry) => boolean
}

export interface WantList {
  entries: Entry[]
  full?: boolean
}

export interface Entry {
  block: Uint8Array
  priority: number
  cancel: boolean
  wantType?: WantType
  sendDontHave?: boolean
}

export interface BlockPresence {
  cid: Uint8Array
  type: BlockPresenceType
}

export type Have = 0
export type DontHave = 1
export type BlockPresenceType = Have | DontHave

export type WantBlock = 0
export type HaveBlock = 1
export type WantType = WantBlock | HaveBlock

export interface BlockData {
  prefix: Uint8Array
  data: Uint8Array
}

export interface Stats {
  enable: () => void
  disable: () => void
  stop: () => void
  readonly snapshot: Record<string, BigInteger>
  readonly movingAverages: Record<string, Record<number, MovingAverage>>
  push: (peer: string|null, counter: string, inc: number) => void
}
