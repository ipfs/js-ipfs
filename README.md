# ipfs implementation in node.

See: https://github.com/jbenet/ipfs

Please put all issues regarding IPFS in the
[ipfs repo issues](https://github.com/jbenet/ipfs/issues).


## submodules


- ipfs - (this repo) master library, puts it all together
- ipfs-netmux - manages connections to multiple networks
- ipfs-peer - manages relationships with other nodes
- ipfs-stream - stream of ipfs packets
- ipfs-routing - ipfs routing module interface
- ipfs-routing-kad - a dht/dsht routing implmenetation
- ipfs-routing-coral - a dsht routing implementation (Coral)
- ipfs-routing-skad - a dht routing implementation (S/Kademlia)
- ipfs-bitswap - the Block Exchange protocol interface
- ipfs-bitswap-standard - the standard bitswap implementation
- ipfs-datastore - datastore interface for ipfs
- ipfs-cadag - the ipfs cadag primitives
- ipfs-fs-objects - the low level git-like ipfs file objects
- ipfs-versioning - implementation of git analogue tools
- ipfs-filesystem - a file system interface
- ipfs-crypto - all crypto functions used by ipfs.
- ipfs-mount - make ipfs mountable
