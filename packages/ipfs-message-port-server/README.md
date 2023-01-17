# ipfs-message-port-server <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-ipfs/test.yml?branch=master\&style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/test.yml?query=branch%3Amaster)

> IPFS server library for exposing IPFS node over message port

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Usage](#usage)
  - [Notes on Performance](#notes-on-performance)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-message-port-server
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `IpfsMessagePortServer` in the global namespace.

```html
<script src="https://unpkg.com/ipfs-message-port-server/dist/index.min.js"></script>
```

## Usage

This library can wrap a JS IPFS node and expose it over the [message channel][].
It assumes `ipfs-message-port-client` on the other end, however it is not
strictly necessary anything complying with the wire protocol will do.

It provides following API subset:

- [`ipfs.dag`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/DAG.md)
- [`ipfs.block`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/BLOCK.md)
- [`ipfs.add`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options)
- [`ipfs.cat`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfscatipfspath-options)
- [`ipfs.files.stat`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfilesstatpath-options)

The server is designed to run in a [SharedWorker][] (although it is possible to
run it in the other JS contexts). The example below illustrates running a js-ipfs
node in a [SharedWorker][] and exposing it to all connected ports

```js
import { create } from 'ipfs'
import { IPFSService, Server } from 'ipfs-message-port-server'

const main = async () => {
  const connections = []
  // queue connections that occur while node was starting.
  self.onconnect = ({ports}) => connections.push(...ports)

  const ipfs = await create()
  const service = new IPFSService(ipfs)
  const server = new Server(service)

  // connect new ports and queued ports with the server.
  self.onconnect = ({ports}) => server.connect(ports[0])
  for (const port of connections.splice(0)) {
    server.connect(port)
  }
}

main()
```

### Notes on Performance

Since the data sent over the [message channel][] is copied via
the [structured cloning algorithm][] it may lead to suboptimal
results (especially with large binary data). In order to avoid unnecessary
copying the server will transfer all passed [Transferable][]s which will be emptied
on the server side. This should not be a problem in general as IPFS node itself
does not retain references to returned values, but is something to keep in mind
when doing something custom.

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

[message channel]: https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel

[SharedWorker]: https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker

[`MessagePort`]: https://developer.mozilla.org/en-US/docs/Web/API/MessagePort

[structured cloning algorithm]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

[Transferable]: https://developer.mozilla.org/en-US/docs/Web/API/Transferable

[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob

[File]: https://developer.mozilla.org/en-US/docs/Web/API/File
