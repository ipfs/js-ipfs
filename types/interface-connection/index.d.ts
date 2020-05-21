import Multiaddr from "multiaddr"
import PeerId from "peer-id"
import {DuplexStream} from "ipfs-interface"

type Timeline = {
  open:string
  upgraded:string
}

type ConnectionMetadata = {
  direction: "inbound"|"outbound",
  timeline:Timeline,
  multiplexer:string,
  encryption:string
}

interface ConnectionInfo {
  localAddr?:Multiaddr
  remoteAddr?:Multiaddr
  localPeer?:PeerId
  remotePeer?:PeerId
  stat:ConnectionMetadata
}

interface ConnectionController {
  newStream():void
  close():void
  getStreams():void
}

export enum Status {
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed'
}

export class Connection {
  id:string
  localAddr:Multiaddr
  remoteAddr:Multiaddr
  localPeer:PeerId
  remotePeer:PeerId
  readonly stat: ConnectionMetadata & { status: Status }

  constructor(options:ConnectionInfo & ConnectionController);

  streams():Iterable<DuplexStream<Buffer, Buffer>>
  close():Promise<void>
  removeStream(id:string):void
  addStream(muxedStream:DuplexStream<Buffer, Buffer>, info:{protocol:string, metadata:Object}):void
  newStream(protocols:string[]):Promise<DuplexStream<Buffer, Buffer>>
}

