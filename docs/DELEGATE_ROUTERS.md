# Configuring Delegate Routers <!-- omit in toc -->

- [What is it?](#what-is-it)
- [How do I do it?](#how-do-i-do-it)

## What is it?

Delegate routers perform tasks on behalf of nodes that may be missing functionality, so for example they may search the DHT for peers or content providers on behalf of IPFS implementations that do not have a DHT.

The delegate node is started and the client of the delegate calls API methods using the IPFS HTTP API client.

## How do I do it?

If you need to support Delegated Content and/or Peer Routing, you can enable it by specifying the multiaddrs of your delegate nodes in the config via `options.config.Addresses.Delegates`. If you need to run a delegate router we encourage you to run your own, with go-ipfs. You can see instructions for doing so in the [delegated routing example](https://github.com/libp2p/js-libp2p/tree/master/examples/delegated-routing).

If you are not able to run your own delegate router nodes, we currently have two nodes that support delegated routing. **Important**: As many people may be leveraging these nodes, performance may be affected, which is why we recommend running your own nodes in production.

Available delegate multiaddrs are:

- `/dns4/node0.delegate.ipfs.io/tcp/443/https`
- `/dns4/node1.delegate.ipfs.io/tcp/443/https`
- `/dns4/node2.delegate.ipfs.io/tcp/443/https`
- `/dns4/node3.delegate.ipfs.io/tcp/443/https`

**Note**: If more than 1 delegate multiaddr is specified, the actual delegate will be randomly selected on startup.

**Note**: If you wish to use delegated routing and are creating your node _programmatically_ in Node.js or the browser you must `npm install libp2p-delegated-content-routing` and/or `npm install libp2p-delegated-peer-routing` and provide configured instances of them in [`options.libp2p`](./MODULE.md#optionslibp2p). See the module repos for further instructions:

- https://github.com/libp2p/js-libp2p-delegated-content-routing
- https://github.com/libp2p/js-libp2p-delegated-peer-routing
