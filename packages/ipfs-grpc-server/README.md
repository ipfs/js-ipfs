# ipfs-grpc-server

> A gRPC server that runs over a websocket

## Why?

[gRPC-web](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md) allows us to form HTTP requests out of gRPC invocations, but the [official implementation](https://github.com/grpc/grpc-web) supports only unary calls and server streaming, which in terms of functionality doesn't give us much over the existing [ipfs-http-client](https://www.npmjs.com/package/ipfs-http-client).

In order to support streaming file uploads with errors, pubsub, etc, bi-directional streaming is required.  We can either use Websockets for this, or use two connections, one for upload and one for download though this involves two requests for every operation and some orchestration on the server side to match one up with the other.

Websockets are a cheaper and simpler way of accomplishing the same thing though sadly the official gRPC implementation has [no plans](https://github.com/grpc/grpc-web/blob/master/doc/streaming-roadmap.md#issues-with-websockets) to implement full-duplex streaming in this way.

This module implements a Websocket proxy for a gRPC-web server.  It's a js port of the [grpcwebproxy](https://github.com/improbable-eng/grpc-web/tree/master/go/grpcwebproxy) project from [improbable-eng/grpc-web](https://github.com/improbable-eng/grpc-web).

## Protocol

Every RPC invocation opens a new WebSocket connection, the invocation is completed and the socket connection is closed.

The connection is opened against the path of the RPC method the client wishes to invoke.  The path is created from the protobuf service definition package, service and procedure name.

E.g. given the following service definition:

```protobuf
package ipfs;

service Root {
  rpc id (Req) returns (Res) {}
}
```

A path of `/ipfs.Root/id` would be created.

There are three parts to the communication, metadata, messages and trailers.  Communication is symmetrical; that is, the client sends metadata, one or more messages and finally some trailers and the server responds with metadata, one or more messages and finally some trailers.

The amount of messages a client/server can send is dictated by if the RPC method is unary or streaming and if so in which direction.

Unary will result in one message sent and one received, client streaming is many sent and one received, server streaming is one sent and many received and finally bidirectional is many sent and many received.

### 1. Metadata

Metadata is sent as the first websocket message. It is a utf8 encoded list in the same format as [HTTP Headers][]

### 2. Messages

One ore more messages will be sent.  Messages are sent as a single websocket message and contain a signal, a header, some message data and an optional trailer.

Every message sent to or received from the server will have the following format:

| byte index | Notes |
|---|---|
| 0       | Signal |
| 1-5     | Header |
| n1-n2   | Message data |
| n3-n3+5 | Trailer

#### Signal

A one-byte field.

| Value | Meaning |
|---|---|
| 0       | START_SEND: Further messages will be sent as part of this context |
| 1       | FINISH_SEND: This is the final message, no further data will be sent |

#### Header

A five-byte field that contains one byte signifying if it's a Header or a Trailer and four bytes that contain the length of the following data.

| byte index   | Meaning |
|--------------|---|
| 0            | 0: This is a header, 128: This is a footer |
| 1-4          | An unsigned big-endian 32-bit integer that specifies the length of the message |

#### Message data

A protocol buffer message, the length of which is defined in the header

#### Trailer

A five-byte field that contains one byte signifying if it's a Header or a Trailer and four bytes that contain the length of the following data.

| byte index   | Meaning |
|--------------|---|
| 0            | 0: This is a header, 128: This is a footer |
| 1-4          | A big-endian 32-bit integer that specifies the length of the trailer |

The trailer contains [HTTP headers][] as a utf8 encoded string in the same way as invocation metadata.

## Handlers

Method handlers come in four flavours - unary, server streaming, client streaming, bidirectional streaming and accept metadata as an argument.

### Metadata

All methods accept metadata which are sent as the equivalent of HTTP headers as part of every request.  These are accepted by the client as options to a given method.

E.g.:

```js
ipfs.addAll(source, options)
// `source` will be turned into a message stream
// `options` will be sent as metadata
```

### Unary

The simplest case, one request message and one response message.

```javascript
export function grpcFunction (ipfs, options = {}) {
  async function handler (request, metadata) {
    const response = {
      //... some fields here
    }

    return response
  }

  return handler
}
```

### Server streaming

Where the server sends multiple messages.  `sink` is an [it-pushable][].

```javascript
export function grpcFunction (ipfs, options = {}) {
  async function serverStreamingHandler (request, sink, metadata) {
    sink.push(..)
    sink.push(..)

    sink.end()
  }

  return clientStreamingHandler
}
```

### Client streaming

Where the client sends multiple messages.  `source` is an [AsyncIterator][].

```javascript
export function grpcFunction (ipfs, options = {}) {
  async function clientStreamingHandler (source, metadata) {
    const response = {
      //... some fields here
    }

    for await (const thing of source) {
      // do something with `thing`
    }

    return response
  }

  return handler
}
```

### Bidirectional streaming

Where the client and the server both send multiple messages.  `source` is an [AsyncIterator][] and `sink` is an [it-pushable][].

```javascript
export function grpcFunction (ipfs, options = {}) {
  async function bidirectionalHandler (source, sink, metadata) {
    for await (const thing of source) {
      sink.push(sink)
    }

    sink.end()
  }

  return bidirectionalHandler
}
```

[HTTP headers]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
[it-pushable]: https://www.npmjs.com/package/it-pushable
[AsyncIterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
