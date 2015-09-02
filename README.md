node-ipfs
=========

> IPFS Node.js entry point and implementation roadmap

# Description

This repo (will) contains the entry point for the Node.js implementation of IPFS spec, similar to go-ipfs. It also presents the roadmap a modules of node-ipfs and their current state.


# Usage

> Not ready for prime time yet

# Roadmap

- Network
  - [ ] libp2p
    - [ ] Peer Routing
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
      - [ ] record (needs MerkleDAG node) https://github.com/diasdavid/node-ipfs-record
      - [ ] distributed record store
      - [ ] kad-record-store (implements abstract record store)
      - [ ] abstract-record-store
- Exchange
  - [ ] bitswap
- MerkleDAG
  - [x] MerkleDAG node implementation (needs IPLD)
    - [x] https://github.com/diasdavid/node-ipld
    - [x] MerkleDAGStore https://github.com/diasdavid/node-merkledag-store 
- Spec 
  - https://github.com/ipfs/specs/pull/19
