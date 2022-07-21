# IPFS Core API

This directory contains the description of the core JS IPFS API. In order to be considered "valid", a JS IPFS core implementation must expose the API described here. 
This abstraction allows for different implementations including:
1. Full JavaScript native implementation
2. Delgate implementation that invokes another IPFS implementation (e.g., Kubo)

You can use this loose spec as documentation for consuming the core APIs.  

It is broken up into the following sections:

* [BITSWAP.md](BITSWAP.md)
* [BLOCK.md](BLOCK.md)
* [BOOTSTRAP.md](BOOTSTRAP.md)
* [CONFIG.md](CONFIG.md)
* [DAG.md](DAG.md)
* [DHT.md](DHT.md)
* [FILES.md](FILES.md)
* [KEY.md](KEY.md)
* [MISCELLANEOUS.md](MISCELLANEOUS.md)
* [NAME.md](NAME.md)
* [OBJECT.md](OBJECT.md)
* [PIN.md](PIN.md)
* [PUBSUB.md](PUBSUB.md)
* [REFS.md](REFS.md)
* [REPO.md](REPO.md)
* [STATS.md](STATS.md)
* [SWARM.md](SWARM.md)

## History
This API was created based off the [Kubo RPC HTTP API](https://docs.ipfs.io/reference/kubo/rpc/).  There is no guarantee they stay fully in sync.
