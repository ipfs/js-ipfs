
import { EventEmitter } from 'events'
import CID from 'cids'
import Block from 'ipld-block'
import PeerId from 'peer-id'
import PeerInfo from 'peer-info'
import Multiaddr from 'multiaddr'
import Repo, {BlockStore} from 'ipfs-repo'
import { Connection } from "interface-connection"


// @todo: Figure out proper return values here
declare function findProviders(cid: CID, maxProviders: number): Promise<any> // Promise<Result<Array>>
declare function findAndConnect(cid: CID): void
declare function connectTo(peer: (PeerInfo | PeerId | Multiaddr)): Promise<Connection>
interface Options {
  statsEnabled?: boolean
  statsComputeThrottleTimeout?: number
  statsComputeThrottleMaxQueueSize?: number
}

declare class Stat extends EventEmitter {
  constructor(initialCounters: string[], options: object)
  enable(): void
  disable(): void
  stop(): void
  readonly snapshot: any
  readonly movingAverages: any
  push(counter: number, inc: number): void
}

declare class Stats extends EventEmitter {
  // @todo: this is likely pretty wrong
  constructor(initialCounters: string[], options: any)
  enable(): void
  disable(): void
  stop(): void
  readonly snapshot: any
  readonly movingAverages: any
  forPeer(peerId: PeerId): Stat
  push(peer: PeerInfo, counter: number, inc: number): void
  disconnected(peer: PeerInfo): void
}

declare class BitswapMessageEntry {
  constructor (cid: CID, priority: number, cancel: boolean)
  readonly [Symbol.toStringTag]: any
  cid: CID
  priority: number
  equals (other: BitswapMessageEntry): boolean
}
declare class BitswapMessage {
  constructor (full: boolean)
  readonly [Symbol.toStringTag]: any
  readonly empty: boolean
  addEntry (cid: CID, priority: number, cancel: boolean): void
  addBlock (block: Block): void
  cancel (cid: CID): void
  serializeToBitswap100 (): Buffer
  serializeToBitswap110 (): Buffer
  equals (other: BitswapMessage): boolean
  static deserialize (raw: Buffer): BitswapMessage
}

declare namespace BitswapMessage {
  type Entry = BitswapMessageEntry
}

declare class Network {
  constructor(libp2p: any, bitswap: Bitswap, options: object, stats: Stats)
  libp2p: any
  bitswap: Bitswap
  b100Only: boolean
  start(): void
  stop(): void
  findProviders (cid: CID, maxProviders: number): Promise<any>
  findAndConnect (cid: CID): Promise<void>
  provide (cid: CID): Promise<void>
  sendMessage (peer: PeerInfo | PeerId | Multiaddr, msg: BitswapMessage): Promise<void>
  connectTo (peer: PeerInfo | PeerId | Multiaddr): Promise<Connection>

}
declare class MsgQueue {
  constructor (selfPeerId: PeerId, otherPeerId: PeerId, network: Network)
  peerId: PeerId
  network: Network
  refcnt: number
  sendEntries(): void
  addMessage (msg: BitswapMessage): void
  addEntries (entries: any[]): void
  send (msg: BitswapMessage): Promise<void>
}
declare class WantListEntry {
  constructor (cid: CID, priority: number)
  readonly [Symbol.toStringTag]: any
  cid: CID
  priority: number
  inc(): void
  dec(): void
  hasRefs(): boolean
  equals (other: WantListEntry): boolean
}
declare class Wantlist {
  constructor (stats: Stats)
  set: Map<string, Wantlist.Entry>
  readonly length: number
  add (cid: CID, priority: number): void
  remove (cid: CID): void
  removeForce (cidStr: string): void
  forEach (fn: (value: Wantlist.Entry, key: number) => any): undefined
  entries (): Iterator<Wantlist.Entry>
  sortedEntries (): Map<string, Wantlist.Entry>
  contains (cid: CID): Wantlist.Entry
}
declare namespace Wantlist {
  type Entry = WantListEntry
}
declare class WantManager {
  constructor (peerId: PeerId, network: Network, stats: Stats)
  peers: Map<string, MsgQueue>
  wantlist: Wantlist
  network: Network
  _stats: Stats
  _peerId: PeerId
  wantBlocks (cids: CID[]): void
  unwantBlocks (cids: CID[]): void
  cancelWants (cids: CID[]): void
  connectedPeers (): string[]
  connected (peerId: PeerId): void
  disconnected (peerId: PeerId): void
  start (): void
  stop (): void
}

declare class Notifications extends EventEmitter {
  constructor(peerId: PeerId)
  _unwantListeners: object
  _blockListeners: object
  hasBlock (block: Block): void
  wantBlock (cid: CID): Promise<Block>
  unwantBlock (cid: CID): void
  _cleanup (cidStr: string): void
}
// class DecisionEngine {
//   constructor (peerId: PeerId, blockstore: Blockstore, network: Network, stats: Stats)
//   blockstore: Blockstore
//   network: Network
//   _stats: Stats
//   ledgerMap: Map<string, Ledger>
//   wantlistForPeer (peerId: PeerId)
//   ledgerForPeer (peerId: PeerId)
//   peers (): []
//   receivedBlocks (cids: CID[])
//   async messageReceived (peerId: PeerId, msg: BitswapMessage)
//   messageSent (peerId: PeerId, block: Block)
//   numBytesSentTo (peerId: PeerId)
//   numBytesReceivedFrom (peerId: PeerId)
//   peerDisconnected (peerId: PeerId)
//   start (): void
//   stop (): void
// }
declare class Bitswap {
  constructor(libp2p: any, blockstore: BlockStore, options?: Options)
  network: Network
  blockstore: BlockStore
  engine: any //DecisionEngine
  wm: WantManager
  notifications: Notifications
  readonly peerInfo: PeerInfo
  enableStats(): void
  disableStats(): void
  wantlistForPeer(peerId: PeerId): Iterable<WantListEntry>
  ledgerForPeer(peerId: PeerId): object
  get(cid: CID): Promise<Block>
  getMany(cids: Iterable<CID>): AsyncIterable<Block>
  unwant(cids: Iterable<CID>): void
  cancelWants(cids: Iterable<CID>): void
  put(block: Block): Promise<void>
  putMany(blocks: (AsyncIterable<Block> | Iterable<Block>)): Promise<void>
  getWantlist(): Iterable<WantListEntry>
  peers(): Iterable<PeerId>
  stat(): Stats
  start(): void
  stop(): void
}

declare namespace Bitswap {
  export {
    findProviders,
    findAndConnect,
    connectTo
  }
}

export=Bitswap

