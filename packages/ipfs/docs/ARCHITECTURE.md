# IPFS Architecture

![](../img/architecture.png)

[Annotated version](https://user-images.githubusercontent.com/1211152/47606420-b6265780-da13-11e8-923b-b365a8534e0e.png)

What does this image explain?

- IPFS uses `ipfs-repo` which picks `fs` or `indexeddb` as its storage drivers, depending if it is running in Node.js or in the Browser.
- The exchange protocol, `bitswap`, uses the Block Service which in turn uses the Repo, offering a get and put of blocks to the IPFS implementation.
- The DAG API (previously Object) comes from the IPLD Resolver, it can support several IPLD Formats (i.e: dag-pb, dag-cbor, etc).
- The Files API uses `ipfs-unixfs-engine` to import and export files to and from IPFS.
- libp2p, the network stack of IPFS, uses libp2p to dial and listen for connections, to use the DHT, for discovery mechanisms, and more.

## Code Architecture and folder Structure

![](img/overview.png)

### Source code

```Bash
> tree src -L 2
src                 # Main source code folder
├── cli             # Implementation of the IPFS CLI
│   └── ...
├── http            # The HTTP-API implementation of IPFS as defined by HTTP API spec
├── core            # IPFS implementation, the core (what gets loaded in browser)
│   ├── components  # Each of IPFS subcomponent
│   └── ...
└── ...
```
