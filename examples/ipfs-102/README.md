# IPFS 102, Spawn Two Nodes, Add a File to One Node and Read from the Other
> This is a simple extension of the IPFS-101 example

In this tutorial, we go through the following steps:

* Spawn two IPFS nodes on a local machine,
* Adding a file to one node, and
* Cat'ing the file from another node using the file's multihash.

You can find a complete version of this tutorial in [index.js](./index.js). 
For this tutorial, you'll need to install the following dependencies:

    npm i -S async ipfs ipfs-repo

Or, you can just clone the repo, and

    cd examples/ipfs-102
    npm i && npm run start


In order to create multiple IPFS instances on the same machine,
you'll need to pass in different repo and config options.
For instance,

```JavaScript
const IPFS = require('ipfs')

const node1 = IPFS.createNode({
  repo: '/tmp/ipfs-repo1',
  config: {
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/5001'
      ]
    }
  },
  // ...
})
```

We can listen for the `ready` or `start` events to learn when the nodes are ready to be used. In this tutorial, we use `async/series` to manage the async flow.

The sample code consists of four parts:


### Create the first node

```JavaScript
node1 = new IPFS({
  repo: repo1,
  init: true,
  start: true,
  EXPERIMENTAL: {
  },
  config: {
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/5001'
      ]
    }
  },
})
```


### Add a file to IPFS via `node1.files.add()`

```JavaScript
let buffer = Buffer.from('Hello World 102');
node1.files.add(buffer, {}, (err, filesAdded) => {
  let path = filesAdded[0].path;
  fileMultihash = filesAdded[0].hash
  console.log('\nAdded file:', path, fileMultihash)
})
```


### Create the second node

```JavaScript
node2 = new IPFS({
  repo: repo2,
  init: true,
  start: true,
  EXPERIMENTAL: {
  },
  config: {
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/5002'
      ]
    }
  },
})
```

### Retrieve the file from IPFS using the file's multihash

```JavaScript
node2.files.cat(fileMultihash, (err, data) => {
  console.log('\nFile content fron node 2:');
  console.log(data);
}),
```



That's it! 
You just added and retrieved a file from multi-node IPFS network!
