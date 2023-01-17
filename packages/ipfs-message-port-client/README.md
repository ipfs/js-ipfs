# ipfs-message-port-client <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-ipfs/test.yml?branch=master\&style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/test.yml?query=branch%3Amaster)

> IPFS client library for accessing IPFS node over message port

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Notes on Performance](#notes-on-performance)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-message-port-client
```

## Usage

This client library works with IPFS node over the [message channel][] and assumes that IPFS node is provided via `ipfs-message-port-server` on the other end.

It provides following API subset:

- [`ipfs.dag`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/DAG.md)
- [`ipfs.block`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/BLOCK.md)
- [`ipfs.add`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options)
- [`ipfs.addAll`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsaddallsource-options)
- [`ipfs.cat`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfscatipfspath-options)
- [`ipfs.files.stat`](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfilesstatpath-options)

A client can be instantiated from the [`MessagePort`][] instance. The primary
goal of this library is to allow sharing a node across browsing contexts (tabs,
iframes) and therefore most likely `ipfs-message-port-server` will be in a
separate JS bundle and loaded in the [SharedWorker][].

```js
import { IPFSClient } from 'ipfs-message-port-client'
// URL to the script containing ipfs-message-port-server.
const IPFS_SERVER_URL = '/bundle/ipfs-worker.js'

const main = async () => {
  const worker = new SharedWorker(IPFS_SERVER_URL)
  const ipfs = IPFSClient.from(worker.port)
  const data = ipfs.cat('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

  for await (const chunk of data) {
    console.log(chunk)
  }
}
```

It is also possible to instantiate a detached client, which can be attached to
the server later on. This is useful when a server port is received via a message
from another JS context (e.g. iframe)

> Note: Client will queue all API calls and only execute them once it is
> attached (unless they time out or are aborted in the meantime).

```js
import { IPFSClient } from 'ipfs-message-port-client'

const ipfs = IPFSClient.detached()

const main = async () => {
  const data = ipfs.cat('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

  for await (const chunk of data) {
    console.log(chunk)
  }
}

window.onload = main
window.onmessage = ({ports}) => {
  IPFSClient.attach(ports[0])
}
```

### Notes on Performance

Since client works with IPFS node over [message channel][] all the data passed
is copied via [structured cloning algorithm][], which may lead to suboptimal
results (especially with large binary data). In order to avoid unnecessary
copying all API options have being extended with optional `transfer` property
that can be supplied [Transferable][]s which will be used to move corresponding
values instead of copying.

> **Note:** Transferring data will empty it on the sender side which can lead to
> errors if that data is used again later. To avoid these errors transfer option
> was added so user can explicitly give up reference when it is safe to do so.

```js
/**
 * @param {Uint8Array} data - Large data chunk
 */
const example = async (data) => {
  // Passing `data.buffer` will cause underlying `ArrayBuffer` to be
  // transferred emptying `data` in JS context.
  ipfs.add(data, { transfer: [data.buffer] })
}
```

It is however recommended to prefer web native [Blob][] / [File][] instances as
most web APIs provide them as option & can be send across without copying
underlying memory.

```js
const example = async (url) => {
  const request = await fetch(url)
  const blob = await request.blob()
  ipfs.add(blob)
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

[message channel]: https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel

[SharedWorker]: https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker

[`MessagePort`]: https://developer.mozilla.org/en-US/docs/Web/API/MessagePort

[structured cloning algorithm]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

[Transferable]: https://developer.mozilla.org/en-US/docs/Web/API/Transferable

[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob

[File]: https://developer.mozilla.org/en-US/docs/Web/API/File
