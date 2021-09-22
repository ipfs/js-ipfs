# ipfs-grpc-client

> A client for the [ipfs-grpc-server][] module

This module implements part of the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) using      gRPC over websockets to achieve the bidirectional streaming necessary to have full duplex streams running in the browser.

It's not recommended you use this directly, instead use the [ipfs-client](https://www.npmjs.com/package/ipfs-client) to combine this with the [ipfs-http-client](https://www.npmjs.com/package/ipfs-http-client) in order to have HTTP fallback for the missing parts of the API.

## Why?

The [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [XHR](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) APIs do not allow for full-duplex streaming, that is, allowing the client to receive bytes from the response while also adding more bytes to the outgoing request.

This limits what we can do in browsers in terms of the API, for example streaming arbitrarily sized payloads or exposing libp2p duplex streams.

gPRC over websockets has no such limitations so allows us to harness the full power of a remote IPFS node in the browser without the need to work around browser behaviour.

## Install

```console
$ npm install ipfs-grpc-client
```

## API

### `create([options])`

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| url | `Multiaddr` or `string` or `URL` | `undefined` | The address of a [ipfs-grpc-server][] to connect to |
| agent | [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) | `undefined` | A http.Agent used to control HTTP client behaviour (node.js only) |

### Returns

| Type | Description |
| -------- | -------- |
| `object` | An instance of the client |

### Example

```js
import { create } from 'ipfs-gprc-client'

const client = create({
  url: '/ipv4/127.0.0.1/tcp/1234/ws'
})

const id = await client.id()
```

[ipfs-grpc-server]: https://www.npmjs.com/package/ipfs-grpc-server
