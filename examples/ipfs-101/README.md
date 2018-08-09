# IPFS 101, spawn a node and add a file to the IPFS network

In this tutorial, we go through spawning an IPFS node, adding a file and cat'ing the file multihash locally and through the gateway.

You can find a complete version of this tutorial in [1.js](./1.js). For this tutorial, you need to install `ipfs` using `npm install ipfs`.

Creating an IPFS instance can be done in one line, after requiring the module, you simply have to:

```js
const IPFS = require('ipfs')

const node = new IPFS()
```

We can listen for the `ready` event to learn when the node is ready to be used. Within the ready event, we'll use `async`/`await` to help us manage the async flow.

As a test, we are going to check the version of the node.

```js
const IPFS = require('ipfs')

const node = new IPFS()

node.on('ready', async () => {
  const version = await node.version()

  console.log('Version:', version.version)
})
```

(If you prefer not to use `async`/`await`, you can instead use `.then()` as you would with any promise,
or pass an [error-first callback](https://nodejs.org/api/errors.html#errors_error_first_callbacks), e.g. `node.version((err, version) => { ... })`)

Running the code above gets you:

```bash
> node 1.js
Version: 0.31.2
```

Now let's make it more interesting and add a file to IPFS using `node.files.add`. A file consists of a path and content.

You can learn about the IPFS File API at [interface-ipfs-core](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md).

```js
node.on('ready', async () => {
  const version = await node.version()

  console.log('Version:', version.version)
  
  const filesAdded = await node.files.add({
    path: 'hello.txt',
    content: Buffer.from('Hello World 101')
  })
  
  console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)
})
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
node.on('ready', async () => {
  const version = await node.version()

  console.log('Version:', version.version)

  const filesAdded = await node.files.add({
    path: 'hello.txt',
    content: Buffer.from('Hello World 101')
  })
  
  console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)

  const fileBuffer = await node.files.cat(filesAdded[0].hash)

  console.log('Added file contents:', fileBuffer.toString())
})
```

That's it! You just added and retrieved a file from the Distributed Web!
