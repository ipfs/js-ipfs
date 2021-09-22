# ipfs-client

> A client for [ipfs][] daemons

This module combines the [ipfs-grpc-client][] and [ipfs-http-client][] modules to give you a client that is capable of bidirectional streaming in the browser as well as node.

## Install

```console
$ npm install ipfs-client
```

## API

The client object created by the `createClient` function supports the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api), see the docs for more.

### `create([options])`

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| grpc | `Multiaddr` or `string` or `URL` | `undefined` | The address of a [ipfs-grpc-server][] to connect to |
| http | `Multiaddr` or `string` or `URL` | `undefined` | The address of a [ipfs-http-server][] to connect to |
| agent | [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) | `undefined` | A http.Agent used to control HTTP client behaviour (node.js only) |

### Returns

| Type | Description |
| -------- | -------- |
| `object` | An instance of the client |

### Example

```js
import { create } from 'ipfs-client'

const client = create({
  grpc: '/ipv4/127.0.0.1/tcp/5003/ws',
  http: '/ipv4/127.0.0.1/tcp/5002/http'
})

const id = await client.id()
```

[ipfs]: https://www.npmjs.com/package/ipfs
[ipfs-grpc-client]: https://www.npmjs.com/package/ipfs-grpc-client
[ipfs-http-client]: https://www.npmjs.com/package/ipfs-http-client
[ipfs-grpc-server]: https://www.npmjs.com/package/ipfs-grpc-server
[ipfs-http-server]: https://www.npmjs.com/package/ipfs-http-server
