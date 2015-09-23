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

> **Not ready for prime time yet**

# Roadmap

- Network
  - [ ] [libp2p-website](https://github.com/diasdavid/libp2p-website).
  - [ ] [node-libp2p](https://github.com/diasdavid/node-libp2p) _(the entry point)_.
    - [x] [PeerInfo](https://github.com/diasdavid/node-peer-info)
    - [x] [PeerId](https://github.com/diasdavid/node-peer-id)
    - Peer Routing
      - [x] [node-ipfs-kad-router](https://github.com/diasdavid/node-ipfs-kad-router). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/18).
        - discovery mechanisms
          - [x] [node-ipfs-mdns](https://github.com/diasdavid/node-ipfs-mdns) _mDNS-discovery_. [Discussion issue](https://github.com/ipfs/node-ipfs/issues/19).
          - [ ] [node-ipfs-random-walk](https://github.com/diasdavid/node-ipfs-random-walk). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/20).
          - [x] [node-ipfs-railing](https://github.com/diasdavid/node-ipfs-railing) _Bootstrap-list_. [Discussion issue](https://github.com/ipfs/node-ipfs/issues/21).
      - [ ] mDNS-routing
    - [x] Swarm. 
      - Main repo [node-libp2p-swarm](https://github.com/diasdavid/node-libp2p-swarm). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/22).
      - [x] Identify Protocol [identify](https://github.com/diasdavid/node-libp2p-swarm/tree/master/src/identify).
      - [x] [node-ipfs-ping](https://github.com/diasdavid/node-ipfs-ping).
      - [x] Connection Interface [abstract-connection](https://github.com/diasdavid/abstract-connection)
      - Transports
        - [x] Transport Interface [abstract-transport](https://github.com/diasdavid/abstract-transport)
        - [x] [libp2p-tcp](https://github.com/diasdavid/node-libp2p-tcp)
        - [ ] [libp2p-udp](https://github.com/diasdavid/node-libp2p-udp)
        - [ ] [libp2p-udt](https://github.com/diasdavid/node-libp2p-udt)
        - [ ] [libp2p-utp](https://github.com/diasdavid/node-libp2p-utp)
        - [ ] libp2p-webrtc
        - [ ] libp2p-cjdns
      - Upgrades
        - [ ] libp2p-tls
      - Stream Muxing
        - [x] [abstract-stream-muxer](https://github.com/diasdavid/abstract-stream-muxer).
        - [x] [node-spdy-stream-muxer](https://github.com/diasdavid/node-spdy-stream-muxer) _stream muxer_. [Discussion issue](https://github.com/ipfs/node-ipfs/issues/23).
        - [x] [libp2p-spdy](https://github.com/diasdavid/node-libp2p-spdy/blob/master/src/index.js) _stream muxer upgrade_
      - Protocol Muxing
        - [x] [node-multistream](https://github.com/diasdavid/node-multistream) _protocol muxer_. [Discussion issue](https://github.com/ipfs/node-ipfs/issues/24).
        - [x] [node-multistream](https://github.com/diasdavid/node-multistream).
    - [ ] Distributed Record Store. [Discussion issue](https://github.com/ipfs/node-ipfs/issues/25).
      - [x] [node-ipfs-record](https://github.com/diasdavid/node-ipfs-record) _record (needs MerkleDAG node)_.
      - [x] [node-ipfs-distributed-record-store](https://github.com/diasdavid/node-ipfs-distributed-record-store).
      - [x] [node-ipfs-kad-record-store](https://github.com/diasdavid/node-ipfs-kad-record-store) _implements abstract record store_.
      - [x] [abstract-record-store](https://github.com/diasdavid/abstract-record-store).
- Exchange
  - [ ] [node-bitswap](https://github.com/diasdavid/node-bitswap). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/17).
- MerkleDAG
  - [x] MerkleDAG node implementation (needs IPLD).
    - [x] [node-ipld](https://github.com/diasdavid/node-ipld).
    - [x] [node-merkledag-store](https://github.com/diasdavid/node-merkledag-store).
- Supporting modules
  - [ ] [webcrypto](https://github.com/diasdavid/webcrypto). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/27).
  - [x] [node-multihash](https://github.com/jbenet/node-multihash). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/26).
  - [x] [node-multihashing](https://github.com/jbenet/node-multihashing). [Discussion issue](https://github.com/ipfs/node-ipfs/issues/26).
  - [x] [node-multiaddr](https://github.com/jbenet/node-multiaddr).
- Spec
  - [specs/19](https://github.com/ipfs/specs/pull/19).

