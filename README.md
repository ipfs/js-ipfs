# ipfs implementation in node.

See: https://github.com/jbenet/ipfs

Please put all issues regarding IPFS _design_ in the
[ipfs repo issues](https://github.com/jbenet/ipfs/issues).

Please put all issues regarding node IPFS _implementation_ in [this repo](https://github.com/jbenet/node-ipfs/issues).

## [submodules](submodules/)

In progress:

- ipfs - (this repo) master library, puts it all together
- ipfs-bitswap - the Block Exchange protocol interface
- ipfs-block - ipfs unit of data
- ipfs-blocks - block service, using ipfs-storage
- ipfs-cli - cli to a local ipfs node
- ipfs-core - small hub, wires the core together
- ipfs-dht - dht implementation (coral + s/kademlia)
- ipfs-dht-routing - routing system using dht
- ipfs-errors - errors (deprecated)
- ipfs-message-stream - stream of packets (replaced by msgproto)
- ipfs-mount - mount ipfs node using FUSE
- ipfs-object - base ipfs object structure
- ipfs-objects-git - git-like objects for filesystem + version control
- ipfs-packet - packet coding (replaced by msgproto)
- ipfs-path - ipfs path structure
- ipfs-path-resolver - resolves paths using ipfs-blocks
- ipfs-peer - a peer identity, including id and network addresses
- ipfs-peer-ledger - relationship ledger between local and another peer
- ipfs-peer-book - keeps track of multiple peer relationships
- ipfs-routing - routing system interface
- ipfs-storage - local node storage (kv store)

Todo:

- ipfs-netmux - manages connections to multiple networks
- ipfs-bitswap - the Block Exchange protocol interface
- ipfs-bitswap-standard - the standard bitswap implementation
- ipfs-datastore - datastore interface for ipfs
- ipfs-cadag - the ipfs cadag primitives
- ipfs-versioning - implementation of git analogue tools
- ipfs-filesystem - a file system interface
- ipfs-crypto - all crypto functions used by ipfs.
