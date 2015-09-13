node-ipfs
=========

> IPFS Node.js entry point and implementation roadmap

# Description

This repo will contain the entry point for the Node.js implementation of IPFS spec, similar to [go-ipfs](https://github.com/ipfs/go-ipfs). Right now, it holds the roadmap for the development of modules for node-ipfs, as well as their current state.

We are building node-ipfs because it will inform how go-ipfs works, separate concerns, and allow a complete in-browser-tab implementation with no install friction. Most of the work for IPFS does happen elsewhere, but this is an equally important part of our roadmap to lead to a permanent, IPFSed web.

# Contribute

IPFS in Node is a work in progress. As such, there's a few things you can do right now to help out:

  * Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrasture behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
  * **Perform code reviews**. Most of this has been developed by @diasdavid, which means that more eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
  * Take a look at go-ipfs and some of the planning repositories or issues: for instance, the libp2p spec [here](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.
  * **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

# Usage

> Not ready for prime time yet


# Roadmap

- Network
  - [ ] libp2p (the entry point) https://github.com/diasdavid/node-libp2p
    - Peer Routing
      - [x] kad-routing https://github.com/diasdavid/node-ipfs-kad-router
        - discovery mechanisms
          - [x] mDNS-discovery (https://github.com/diasdavid/node-ipfs-mdns)
          - [ ] random-walk (https://github.com/diasdavid/node-ipfs-random-walk)
          - [x] bootstrap-list (https://github.com/diasdavid/node-ipfs-railing)
      - [ ] mDNS-routing
    - [x] swarm (https://github.com/diasdavid/node-ipfs-swarm)
      - [x] stream muxer (https://github.com/diasdavid/node-spdy-stream-muxer)
      - [x] protocol muxer (https://github.com/diasdavid/node-multistream
      - [x] Identify (https://github.com/diasdavid/node-ipfs-swarm/tree/master/src/identify)
    - [ ] Distributed Record Store
      - [x] record (needs MerkleDAG node) https://github.com/diasdavid/node-ipfs-record
      - [x] distributed record store https://github.com/diasdavid/node-ipfs-distributed-record-store
      - [x] kad-record-store (implements abstract record store) https://github.com/diasdavid/node-ipfs-kad-record-store
      - [x] abstract-record-store https://github.com/diasdavid/abstract-record-store
- Exchange
  - [ ] bitswap https://github.com/diasdavid/node-bitswap
- MerkleDAG
  - [x] MerkleDAG node implementation (needs IPLD)
    - [x] https://github.com/diasdavid/node-ipld
    - [x] MerkleDAGStore https://github.com/diasdavid/node-merkledag-store
- Spec
  - https://github.com/ipfs/specs/pull/19

