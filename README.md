js-ipfs
=======

> IPFS JavaScript implementation  entry point and roadmap

# Description

This repo will contain the entry point for the JavaScript implementation of IPFS spec, similar to [go-ipfs](https://github.com/ipfs/go-ipfs). 

We are building js-ipfs because it will inform how go-ipfs works, separate concerns, and allow a complete in-browser-tab implementation with no install friction. Most of the work for IPFS does happen elsewhere, but this is an equally important part of our roadmap to lead to a permanent, IPFSed web.

# Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

  * Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrasture behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
  * **Perform code reviews**. Most of this has been developed by @diasdavid, which means that more eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
  * Take a look at go-ipfs and some of the planning repositories or issues: for instance, the libp2p spec [here](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.
  * **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

# Usage

> **Disclamer: Currently, js-ipfs is not a full IPFS node, it delegates all of its operations to a IPFS node available in the network, see "Getting jsipfs ready" below for more details.

### Installation

```bash
$ npm i ipfs --save
```

```JavaScript
var IPFS = require('ipfs')

var node = new IPFS()
```

### Command line tool

In order to use js-ipfs as a CLI, you must install it with the -g flag.

```bash
$ npm i ipfs -g
```

The cli is availble through `jsipfs` in your terminal

### API


# Getting jsipfs ready

In order to start enabling applications to use the IPFS JavaScript library sooner, we are releasing a version that presents the full API one could expect from a IPFS node, but delegating all the operations on an IPFS node inside the network, using the js-ipfs-api module. The next will be replacing the internal components as the necessary layers for IPFS get developed.

- [ ] Implement IPFS api in JS and use a network node for the operations
- [ ] Build a jsipfs cli with feature parity to go-ipfs cli
- [ ] Build bitswap to work over HTTP to talk with the gateways. Performance can be gained through doing the same requests to several nodes and then presenting our want list and stream from several nodes at the same time. Hash checksum is done on the JS itself

# Roadmap for the full IPFS implementation in JavaScript


- Network
  - [ ] [libp2p-website](https://github.com/diasdavid/libp2p-website).
  - [ ] [js-libp2p](https://github.com/diasdavid/js-libp2p) _(the entry point)_.
    - [x] [PeerInfo](https://github.com/diasdavid/js-peer-info)
    - [x] [PeerId](https://github.com/diasdavid/js-peer-id)
    - Peer Routing
      - [x] [js-ipfs-kad-router](https://github.com/diasdavid/js-ipfs-kad-router). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/18).
        - discovery mechanisms
          - [x] [js-ipfs-mdns](https://github.com/diasdavid/js-ipfs-mdns) _mDNS-discovery_. [Discussion issue](https://github.com/ipfs/js-ipfs/issues/19).
          - [ ] [js-ipfs-random-walk](https://github.com/diasdavid/js-ipfs-random-walk). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/20).
          - [x] [js-ipfs-railing](https://github.com/diasdavid/js-ipfs-railing) _Bootstrap-list_. [Discussion issue](https://github.com/ipfs/js-ipfs/issues/21).
      - [ ] mDNS-routing
    - [x] Swarm. 
      - Main repo [js-libp2p-swarm](https://github.com/diasdavid/js-libp2p-swarm). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/22).
      - [x] Identify Protocol [identify](https://github.com/diasdavid/js-libp2p-swarm/tree/master/src/identify).
      - [x] [js-ipfs-ping](https://github.com/diasdavid/js-ipfs-ping).
      - [x] Connection Interface [abstract-connection](https://github.com/diasdavid/abstract-connection)
      - Transports
        - [x] Transport Interface [abstract-transport](https://github.com/diasdavid/abstract-transport)
        - [x] [libp2p-tcp](https://github.com/diasdavid/js-libp2p-tcp)
        - [ ] [libp2p-udp](https://github.com/diasdavid/js-libp2p-udp)
        - [ ] [libp2p-udt](https://github.com/diasdavid/js-libp2p-udt)
        - [ ] [libp2p-utp](https://github.com/diasdavid/js-libp2p-utp)
        - [ ] libp2p-webrtc
        - [ ] libp2p-cjdns
      - Upgrades
        - [ ] libp2p-tls
      - Stream Muxing
        - [x] [abstract-stream-muxer](https://github.com/diasdavid/abstract-stream-muxer).
        - [x] [js-spdy-stream-muxer](https://github.com/diasdavid/js-spdy-stream-muxer) _stream muxer_. [Discussion issue](https://github.com/ipfs/js-ipfs/issues/23).
        - [x] [libp2p-spdy](https://github.com/diasdavid/js-libp2p-spdy/blob/master/src/index.js) _stream muxer upgrade_
      - Protocol Muxing
        - [x] [js-multistream](https://github.com/diasdavid/js-multistream) _protocol muxer_. [Discussion issue](https://github.com/ipfs/js-ipfs/issues/24).
        - [x] [js-multistream](https://github.com/diasdavid/js-multistream).
    - [ ] Distributed Record Store. [Discussion issue](https://github.com/ipfs/js-ipfs/issues/25).
      - [x] [js-ipfs-record](https://github.com/diasdavid/js-ipfs-record) _record (needs MerkleDAG node)_.
      - [x] [js-ipfs-distributed-record-store](https://github.com/diasdavid/js-ipfs-distributed-record-store).
      - [x] [js-ipfs-kad-record-store](https://github.com/diasdavid/js-ipfs-kad-record-store) _implements abstract record store_.
      - [x] [abstract-record-store](https://github.com/diasdavid/abstract-record-store).
- Exchange
  - [ ] [js-bitswap](https://github.com/diasdavid/js-bitswap). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/17).
- MerkleDAG
  - [x] MerkleDAG node implementation (needs IPLD).
    - [x] [js-ipld](https://github.com/diasdavid/js-ipld).
    - [x] [js-merkledag-store](https://github.com/diasdavid/js-merkledag-store).
- Supporting modules
  - [ ] [webcrypto](https://github.com/diasdavid/webcrypto). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/27).
  - [x] [js-multihash](https://github.com/jbenet/js-multihash). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/26).
  - [x] [js-multihashing](https://github.com/jbenet/js-multihashing). [Discussion issue](https://github.com/ipfs/js-ipfs/issues/26).
  - [x] [js-multiaddr](https://github.com/jbenet/js-multiaddr).
- Spec
  - [specs/19](https://github.com/ipfs/specs/pull/19).

