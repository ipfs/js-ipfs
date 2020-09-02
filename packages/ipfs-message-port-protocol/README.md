# ipfs-message-port-protocol <!-- omit in toc -->

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs)](https://travis-ci.com/ipfs/js-ipfs)
[![Codecov branch](https://img.shields.io/codecov/c/github/ipfs/js-ipfs/master.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs/status.svg?path=packages/ipfs-message-port-protocol)](https://david-dm.org/ipfs/js-ipfs?path=packages/ipfs-message-port-protocol)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> This package serves as a repository code shared between the core `ipfs-message-port-client` and the `ipfs-message-port-server`

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](https://github.com/achingbrain)

## Table of Contentens <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [Wire protocol codecs](#wire-protocol-codecs)
  - [`CID`](#cid)
  - [Block](#block)
  - [DAGNode](#dagnode)
  - [AsyncIterable](#asynciterable)
  - [Callback](#callback)
- [Contribute](#contribute)
- [License](#license)

## Install

```bash
$ npm install --save ipfs-message-port-protocol
```

## Usage

## Wire protocol codecs

This module provides encode / decode functions for types that are not supported by [structured cloning algorithm][] and therefore need to be encoded before being posted over the [message channel][] and decoded on the other end.

All encoders take an optional `transfer` array. If provided, the encoder will add all `Transferable` fields of the given value so they can be moved across threads without copying.

### `CID`

Codecs for [CID][] implementation in JavaScript.

```js
const { CID, encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')

const cid = new CID('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsu')

const { port1, port2 } = new MessageChannel()

// Will copy underlying memory
port1.postMessage(encodeCID(cid))

// Will transfer underlying memory (cid is corrupt on this thread)
const transfer = []
port1.postMessage(encodeCID(cid, transfer), transfer)

// On the receiver thread
port2.onmessage = ({data}) => {
  const cid = decodeCID(data)
  data instanceof CID // => true
}
```

### Block

Codecs for [IPLD Block][] implementation in JavaScript.

```js
const { Block, encodeBlock, decodeBlock } = require('ipfs-message-port-protocol/src/block')

const data = new TextEncoder().encode('hello')
const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
const block = new Block(data, cid)

const { port1, port2 } = new MessageChannel()

// Will copy underlying memory
port1.postMessage(encodeBlock(block))

// Will transfer underlying memory (block & cid will be corrupt on this thread)
const transfer = []
port1.postMessage(encodeBlock(block, transfer), transfer)


// On the receiver thread
port2.onmessage = ({data}) => {
  const block = decodeBlock(data)
  block instanceof Block // true
}
```

### DAGNode

Codec for DAGNodes accepted by `ipfs.dag.put` API.

```js
const { encodeNode, decodeNode } = require('ipfs-message-port-protocol/src/dag')


const cid = CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
const dagNode = { hi: 'hello', link: cid }

const { port1, port2 } = new MessageChannel()

// Will copy underlying memory
port1.postMessage(encodeNode(dagNode))

// Will transfer underlying memory (`dagNode.link` will be corrupt on this thread)
const transfer = []
port1.postMessage(encodeNode(dagNode, transfer), transfer)


// On the receiver thread
port2.onmessage = ({data}) => {
  const dagNode = decodeNode(data)
  dagNode.link instanceof CID // true
}
```

### AsyncIterable

This encoder encodes [async iterables][] such that they can be transferred
across threads and decoded by a consumer on the other end while taking care of
all the IO coordination between two. It needs to be provided `encoder` /
`decoder` function to encode / decode each yielded item of the async iterable.
Unlike other encoders the `transfer` argument is mandatory (because async
iterable is encoded to a [MessagePort][] that can only be transferred).


```js
const { encodeIterable, decodeIterable } = require('ipfs-message-port-protocol/src/core')

const data = ipfs.cat('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

const { port1, port2 } = new MessageChannel()

// Will copy each chunk to the receiver thread
{
  const transfer = []
  port1.postMessage(
    encodeIterable(content, chunk => chunk, transfer),
    transfer
  )
}


// Will transfer each chunk to the receiver thread (corrupting it on this thread)
{
  const transfer = []
  port1.postMessage(
    encodeIterable(
      content,
      (chunk, transfer) => {
        transfer.push(chunk.buffer)
        return chunk
      },
      transfer
    ),
    transfer
  )
}


// On the receiver thread
port2.onmessage = async ({data}) => {
  for await (const chunk of decodeIterable(data)) {
    chunk instanceof Uint8Array
  }
}
```

### Callback

Primitive callbacks that take single parameter supported by [structured cloning algorithm][] like progress callback used across IPFS APIs can be encoded / decoded. Unilke most encoders `transfer` argument is required (because value is encoded to a [MessagePort][] that can only be transferred)

```js
const { encodeCallback, decodeCallback } = require('ipfs-message-port-protocol/src/core')

const { port1, port2 } = new MessageChannel()

const progress = (value) => console.log(progress)

const transfer = []
port1.postMessage(encodeCallback(progress, transfer))


// On the receiver thread
port2.onmessage = ({data}) => {
  const progress = decodeCallback(data)
  // Invokes `progress` on the other end
  progress(20)
}
```


[structured cloning algorithm]:https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
[message channel]:https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel
[MessagePort]:https://developer.mozilla.org/en-US/docs/Web/API/MessagePort
[Transferable]:https://developer.mozilla.org/en-US/docs/Web/API/Transferable

[IPLD Block]:https://github.com/ipld/js-ipld-block
[CID]:https://github.com/multiformats/js-cid

[async iterables]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of

## Contribute

Contributions welcome. Please check out [the issues](https://github.com/ipfs/js-ipfs/issues).

Check out our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)

