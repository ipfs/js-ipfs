# IPFS 101, spawn a node and add a file to the IPFS network

> This tutorial is the sibling of the [go-ipfs "Using go-ipfs as a library" tutorial](https://github.com/ipfs/go-ipfs/tree/master/docs/examples/go-ipfs-as-a-library).

In this tutorial, we go through spawning an IPFS node, adding a file and cat'ing the file multihash locally and through the gateway.

You can find a complete version of this tutorial in [1.js](./1.js). For this tutorial, you need to install `ipfs` using `npm install ipfs`.

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## Running the example

Creating an IPFS instance can be done in one line, after requiring the module, you simply have to:

```js
const IPFS = require('ipfs')

async function main () {
  const node = await IPFS.create()
  // ...
}

main()
```

As a test, we are going to check the version of the node.

```js
const IPFS = require('ipfs')

async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)
  // ...
}

main()
```

(If you prefer not to use `async`/`await`, you can instead use `.then()` as you would with any promise, or pass an [error-first callback](https://nodejs.org/api/errors.html#errors_error_first_callbacks), e.g. `node.version((err, version) => { ... })`)

Running the code above gets you:

```bash
> node 1.js
Version: 0.31.2
```

Now let's make it more interesting and add a file to IPFS using `node.add`. A file consists of a path and content.

You can learn about the IPFS File API at [interface-ipfs-core](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/SPEC/FILES.md).

```js
const IPFS = require('ipfs')

async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)

  const fileAdded = await node.add({
    path: 'hello.txt',
    content: 'Hello World 101'
  })

  console.log('Added file:', fileAdded.path, fileAdded.cid)
  // ...
}

main()
```

You can now go to an IPFS Gateway and load the printed hash from a gateway. Go ahead and try it!

```bash
> node 1.js
Version: 0.31.2

Added file: hello.txt QmXgZAUWd8yo4tvjBETqzUy3wLx5YRzuDwUQnBwRGrAmAo
# Copy that hash and load it on the gateway, here is a prefiled url:
# https://ipfs.io/ipfs/QmXgZAUWd8yo4tvjBETqzUy3wLx5YRzuDwUQnBwRGrAmAo
```

The last step of this tutorial is retrieving the file back using the `cat` 😺 call.

```js
const IPFS = require('ipfs')

async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)

  const fileAdded = await node.add({
    path: 'hello.txt',
    content: 'Hello World 101'
  })

  console.log('Added file:', fileAdded.path, fileAdded.cid)

  const chunks = []
  for await (const chunk of node.cat(fileAdded.cid)) {
      chunks.push(chunk)
  }

  console.log('Added file contents:', uint8ArrayConcat(chunks).toString())
}

main()
```

That's it! You just added and retrieved a file from the Distributed Web!
