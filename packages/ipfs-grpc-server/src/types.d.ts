import { Pushable } from 'it-pushable'
import { EventEmitter } from 'events'

export interface Options {
  socket?: WebsocketServer
}

export type UnaryEndpoint<InputMessage, OutputMessage, Metadata> = (input: InputMessage, metadata: Metadata) => Promise<OutputMessage>
export type BidirectionalStreamingEndpoint<InputMessage, OutputMessage, Metadata> = (source: AsyncIterable<InputMessage>, sink: Pushable<OutputMessage>, metadata: Metadata) => Promise<void>
export type ClientStreamingEndpoint<InputMessage, OutputMessage, Metadata> = (source: AsyncIterable<InputMessage>, metadata: Metadata) => Promise<OutputMessage>
export type ServerStreamingEndpoint<InputMessage, OutputMessage, Metadata> = (input: InputMessage, sink: Pushable<OutputMessage>, metadata: Metadata) => Promise<void>

export interface WebsocketMessage {
  path: string
  metadata: any
  channel: any
}

export interface WebsocketServer extends EventEmitter {
  // events
  on(event: 'error', listener: (err: Error) => void): this
  on(event: 'data', listener: (message: WebsocketMessage) => void): this
  stop: () => Promise<void>
}
