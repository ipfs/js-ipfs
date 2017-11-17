# IPFS 101, spawn a node and add a file to the IPFS network

In this tutorial, we go through spawning an IPFS node, adding a file and cat'ing the file multihash locally and throught the gateway.

You can find a complete version of this tutorial in [1.js](./1.js). For this tutorial, you need to install the following dependencies: `ipfs` and `async` using `npm install ipfs async`.

Creating an IPFS instance can be done in one line, after requiring the module, you simply have to:

```JavaScript
const IPFS = require('ipfs')

const node = new IPFS()
```

We can listen for the `ready` event to learn when the node is ready to be used. In this part, we start using `async/series` to help us manage the async flow. As a test, we are going to check the version of the node.

```JavaScript
const IPFS = require('ipfs')

const node = new IPFS()

series([
  (cb) => node.on('ready', cb),
  (cb) => node.version((err, version) => {
    if (err) { return cb(err) }
    console.log('Version:', version.version)
    cb()
  })
])
```

Running the code above gets you:

```bash
> node 1.js
IPFS Version: 0.25.0
```

Now lets make it more interesting and add a file to IPFS. We can do it by adding another async call to the series that uses the `node.files.add` call. You can learn about IPFS API for files at [interface-ipfs-core](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md).

```JavaScript
// Create the File to add, a file consists of a path + content. More details on
// https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md
(cb) => node.files.add({
  path: 'hello.txt',
  content: Buffer.from('Hello World')
}, (err, filesAdded) => {
  if (err) { return cb(err) }

  // Once the file is added, we get back an object containing the path, the
  // multihash and the sie of the file
  console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
  fileMultihash = filesAdded[0].hash
  cb()
})
```

If you avoid calling that last `cb()`, the program won't exit enabling you to go to an IPFS Gateway and load the printed hash from a gateway. Go ahead and try it!

```bash
> node 1.js
Version: 0.25.0

Added file: hello.txt QmXgZAUWd8yo4tvjBETqzUy3wLx5YRzuDwUQnBwRGrAmAo
# Copy that hash and load it on the gateway, here is a prefiled url:
# https://ipfs.io/ipfs/QmXgZAUWd8yo4tvjBETqzUy3wLx5YRzuDwUQnBwRGrAmAo
```

The last step of this tutorial is retrieving the file back using the `cat` 😺 call. Add another step on the series chain that does the following:

```JavaScript
(cb) => node.files.cat(fileMultihash, (err, data) => {
  if (err) { return cb(err) }

  console.log('\nFile content:')
  // print the file to the terminal and then exit the program
  process.stdout.write(data)
})
```

That's it! You just added and retrieved a file from the Distributed Web!
