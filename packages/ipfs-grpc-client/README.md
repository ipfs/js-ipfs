# ipfs-grpc-client <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/js-test-and-release.yml)

> A client library for the IPFS gRPC API

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Why?](#why)
- [API](#api)
  - [`create([options])`](#createoptions)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-grpc-client
```

This module implements part of the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) using      gRPC over websockets to achieve the bidirectional streaming necessary to have full duplex streams running in the browser.

It's not recommended you use this directly, instead use the [ipfs-client](https://www.npmjs.com/package/ipfs-client) to combine this with the [ipfs-http-client](https://www.npmjs.com/package/ipfs-http-client) in order to have HTTP fallback for the missing parts of the API.

## Why?

The [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [XHR](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) APIs do not allow for full-duplex streaming, that is, allowing the client to receive bytes from the response while also adding more bytes to the outgoing request.

This limits what we can do in browsers in terms of the API, for example streaming arbitrarily sized payloads or exposing libp2p duplex streams.

gPRC over websockets has no such limitations so allows us to harness the full power of a remote IPFS node in the browser without the need to work around browser behaviour.

## API

### `create([options])`

### Parameters

None

### Options

An optional object which may have the following keys:

| Name  | Type                                                                 | Default     | Description                                                       |
| ----- | -------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| url   | `Multiaddr` or `string` or `URL`                                     | `undefined` | The address of a [ipfs-grpc-server][] to connect to               |
| agent | [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) | `undefined` | A http.Agent used to control HTTP client behaviour (node.js only) |

### Returns

| Type     | Description               |
| -------- | ------------------------- |
| `object` | An instance of the client |

### Example

```js
import { create } from 'ipfs-gprc-client'

const client = create({
  url: '/ipv4/127.0.0.1/tcp/1234/ws'
})

const id = await client.id()
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

[ipfs-grpc-server]: https://www.npmjs.com/package/ipfs-grpc-server
