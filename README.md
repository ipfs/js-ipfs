js-ipfs
=========

> IPFS JavaScript implementation  entry point and roadmap

# Description

This repo will contain the entry point for the JavaScript implementation of IPFS spec, similar to [go-ipfs](https://github.com/ipfs/go-ipfs). Right now, it holds the roadmap for the development of modules for js-ipfs, as well as their current state.

We are building js-ipfs because it will inform how go-ipfs works, separate concerns, and allow a complete in-browser-tab implementation with no install friction. Most of the work for IPFS does happen elsewhere, but this is an equally important part of our roadmap to lead to a permanent, IPFSed web.

# Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

  * Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrasture behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
  * **Perform code reviews**. Most of this has been developed by @diasdavid, which means that more eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
  * Take a look at go-ipfs and some of the planning repositories or issues: for instance, the libp2p spec [here](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.
  * **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

# Usage

> **Not ready for prime time yet**

# Roadmap

- **Network layer**
  - The network layer of IPFS is now known as libp2p, follow https://github.com/diasdavid/js-libp2p
- **Exchange**
  - [ ] [js-bitswap](https://github.com/diasdavid/js-bitswap). [![](https://img.shields.io/badge/discuss--blue.svg?style=flat-square)]](https://github.com/ipfs/js-ipfs/issues/17) - ![](https://img.shields.io/badge/status-has%20not%20started%20yet-brown.svg?style=flat-square)
  - [x] MerkleDAG node implementation (needs IPLD).
    - [x] [js-ipld](https://github.com/diasdavid/js-ipld) ![](https://img.shields.io/badge/status-in%20progress-yellow.svg?style=flat-square)
    - [x] [js-merkledag-store](https://github.com/diasdavid/js-merkledag-store) ![](https://img.shields.io/badge/status-in%20progress-yellow.svg?style=flat-square)
- [**Spec**](https://github.com/ipfs/specs/tree/master/protocol/network) ![](https://img.shields.io/badge/status-in%20progress-yellow.svg?style=flat-square)

### status badges

- ![](https://img.shields.io/badge/status-has%20not%20started%20yet-brown.svg?style=flat-square)
- ![](https://img.shields.io/badge/status-in%20progress-yellow.svg?style=flat-square)
- ![](https://img.shields.io/badge/status-ready-green.svg?style=flat-square)
- [![](https://img.shields.io/badge/discuss--blue.svg?style=flat-square)]](LINK HERE)
