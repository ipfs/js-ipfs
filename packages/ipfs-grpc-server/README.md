> # ⛔️ DEPRECATED: [js-IPFS](https://github.com/ipfs/js-ipfs) has been superseded by [Helia](https://github.com/ipfs/helia)
>
> 📚 [Learn more about this deprecation](https://github.com/ipfs/js-ipfs/issues/4336) or [how to migrate](https://github.com/ipfs/helia/wiki/Migrating-from-js-IPFS)
>
> ⚠️ If you continue using this repo, please note that security fixes will not be provided

# ipfs-grpc-server <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-ipfs/test.yml?branch=master\&style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/test.yml?query=branch%3Amaster)

> A server library for the IPFS gRPC API

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Why?](#why)
- [Protocol](#protocol)
  - [1. Metadata](#1-metadata)
  - [2. Messages](#2-messages)
    - [Signal](#signal)
    - [Header](#header)
    - [Message data](#message-data)
    - [Trailer](#trailer)
- [Handlers](#handlers)
  - [Metadata](#metadata)
  - [Unary](#unary)
  - [Server streaming](#server-streaming)
  - [Client streaming](#client-streaming)
  - [Bidirectional streaming](#bidirectional-streaming)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-grpc-server
```

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

| byte index | Notes        |
| ---------- | ------------ |
| 0          | Signal       |
| 1-5        | Header       |
| n1-n2      | Message data |
| n3-n3+5    | Trailer      |

#### Signal

A one-byte field.

| Value | Meaning                                                               |
| ----- | --------------------------------------------------------------------- |
| 0     | START\_SEND: Further messages will be sent as part of this context    |
| 1     | FINISH\_SEND: This is the final message, no further data will be sent |

#### Header

A five-byte field that contains one byte signifying if it's a Header or a Trailer and four bytes that contain the length of the following data.

| byte index | Meaning                                                                        |
| ---------- | ------------------------------------------------------------------------------ |
| 0          | 0: This is a header, 128: This is a footer                                     |
| 1-4        | An unsigned big-endian 32-bit integer that specifies the length of the message |

#### Message data

A protocol buffer message, the length of which is defined in the header

#### Trailer

A five-byte field that contains one byte signifying if it's a Header or a Trailer and four bytes that contain the length of the following data.

| byte index | Meaning                                                              |
| ---------- | -------------------------------------------------------------------- |
| 0          | 0: This is a header, 128: This is a footer                           |
| 1-4        | A big-endian 32-bit integer that specifies the length of the trailer |

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

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipfs/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

[HTTP headers]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers

[it-pushable]: https://www.npmjs.com/package/it-pushable

[AsyncIterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
