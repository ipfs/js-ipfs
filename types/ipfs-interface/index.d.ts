import CID from "cids"
import { IPLDService } from "ipld"
import IPNSService from "ipns"
import BlockService from "ipfs-block-service"
import {Connection} from "interface-connection"
import {Store} from "interface-datastore"
import PeerInfo from "peer-info"
import PeerId from "peer-id"
import Multiaddr from "multiaddr"
import { BigNumber } from "bignumber.js"
export { CID, BlockService, PeerId, PeerInfo, Multiaddr, Store }

export type TimeoutOptions = {
  timeout?:number|string
  abort?:AbortSignal
}


export type Extends<B, A extends B> = A

// Represents the union type of all the value types of the T object
export type Values<T> = T[keyof T];

// Type that converst union type to intersection type
// e.g. UnionToIntersection<A|B|C> => A & B & C
export type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never




type DagResolve = {
  value:CID
}

type DagResolveOptions = {
  preload?:boolean
  signal?:AbortSignal
}

export interface DagService {
  resolve(path:string, options?:DagResolveOptions):AsyncIterable<DagResolve>
}


type DialOptions = {
  signal?:AbortSignal
}

type FindOptions = {
  signal?:AbortSignal
  timeout?:number
}

type ProviderOptions = {
  cid:CID,
  maxNumProviders?:number
}

export type Address = PeerInfo|PeerId|Multiaddr|string

export interface DuplexStream<I, O, R=void> {
  source:AsyncIterable<I>
  sink(output:AsyncIterable<O>):Promise<R>
}

type LibP2PHandler =
  (info:{connection:Connection, stream:DuplexStream<Buffer, Buffer>, protocol:string}) => void

export interface PeerRouting {
  findPeer(peerId:PeerId, options?:FindOptions):Promise<PeerInfo>
  findProviders(cid:CID, options?:FindOptions & ProviderOptions):AsyncIterator<PeerInfo>
}

type ContentPutOptions = {
  minPeers?:number
}

export interface ContentRouting {
  provide(cid:CID):Promise<CID>
  put(key:string, value:Buffer, options?:ContentPutOptions):Promise<void>
  get(key:string, options?:FindOptions):Promise<Buffer>
  getMany(key:string, nvals:number, options?:FindOptions):Promise<{from:PeerId, val:Buffer}[]>
}

type Notification = {
  from: string,
  data: Buffer,
  seqno: Buffer,
  topicIDs: string[],
  signature: Buffer,
  key: Buffer
}

type Subscriber = (notification:Notification) => void

export interface PubSub {
  getSubscribers(topic:string):Array<string>
  getTopics():Array<string>
  publish(topic:string, data:Buffer):Promise<void>
  subscribe(topic:string, handler:Subscriber):void
  unsubscribe(topic:string, handler:Subscriber):void
}

interface ConnectionManager {
  setPeerValue(peerId:PeerId, value:number):void;
}

type StatsJSON = {
  dataReceived:string,
  dataSent:string,
  movingAverages: number[]
}

interface Stats {
  snapshot: {
    dataReceived:BigNumber
    dataSent:BigNumber
  },
  movingAverages: number[],
  toJSON():StatsJSON
}

interface Metrics {
  global:Stats,
  peers:PeerId[],
  protocols:string[],
  forPeer(peerId:PeerId):Stats,
  forProtocol(protocol:string):Stats,
}

export interface LibP2PService {
  transportManager: {
    getAddrs():Multiaddr[]
  }
  start():Promise<void>
  stop():Promise<void>
  connections:Map<string, Connection[]>

  dial(address:Address, options?:DialOptions):Promise<Connection>
  dialProtocol(address:Address, protocols:string[], options?:DialOptions):Promise<{stream:DuplexStream<Buffer, Buffer>, protocol:string}>
  hangUp(peer:Address, options?:DialOptions):Promise<void>
  handler(protocols:string, handler:LibP2PHandler):void
  unhandle(protocols:string):void
  ping(address:Address):Promise<number>
  peerRouting:PeerRouting
  contentRouting: ContentRouting
  pubSub:PubSub
  connectionManager:ConnectionManager
  metrics:Metrics

  on(type:'error', onerror:(error:Error) => void):void,
  on(type:'peer:discovery', ondiscovery:(peer:PeerId) => void):void,
  on(type:'peer:connect', onconnect:(peer:PeerInfo) => void):void,
  on(type:'peer:disconnect', ondisconnect:(peer:PeerInfo) => void):void,

  // Not in docs but being used
  isStarted():boolean

  peerStore:any

  _dht:any
}

export { IPLDService, IPNSService }
