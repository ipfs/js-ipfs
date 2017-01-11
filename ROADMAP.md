IPFS JavaScript Implementation roadmap
======================================

> We track the development of the js-ipfs project through Github issues and [Waffle.io](https://waffle.io/ipfs/js-ipfs). See our waffle board at: [https://waffle.io/ipfs/js-ipfs](https://waffle.io/ipfs/js-ipfs)

--------------------------------------------------------------------------------------------------

# 2016 Q3

# ✔️  Milestone - js-ipfs on the browser

> Summary: This milestone's focus is to ship a version of js-ipfs that can be embed in browser applications, creating an IPFS node inside a browser web application.

### Tasks:

- [x] files API
  - [x] js-ipfs-unixfs
  - [x] fixed size chunker
  - [x] unixfs layout
  - [x] jsipfs files add
  - [x] jsipfs files get
- [x] jsipfs swarm
  - [x] listen on WebSockets + TCP
  - [x] spdy support
  - [x] identify protocol
  - [x] multistream
  - [x] connect
  - [x] interop with go-ipfs
- [x] block API
- [x] object API
  - [x] js-ipfs-merkle-dag
- [x] repo API
- [x] bitswap
- js-libp2p
  - [x] js-libp2p-swarm
  - [x] js-libp2p-tcp
  - [x] js-libp2p-websockets
  - [x] js-libp2p-spdy
  - [x] js-multiaddr
  - [x] js-multistream
  - [x] js-peer-id
  - [x] js-peer-info
  - [x] js-webcrypto

### Notes:

- This release won't
  - ~~support WebRTC, the communication between browser and machine nodes will happen through WebSockets+SPDY~~
  - support DHT (Kademlia Routing and Record Store)

UPDATE:
- For Milestone 1, we also added:
  - [x] WebRTC transport with [libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star)
  - [x] [secio](https://github.com/ipfs/js-libp2p-secio)

# Milestone - Quality and correctness of the JavaScript Implementation

> Summary: The focus of this milestone is quality of the JavaScript implementation so that users of the library can build their applications with confidence.

### Tasks:

- [x] Interface definition, documentation and test coverage for both js-ipfs and js-ipfs-api. The `interface-ipfs-core` effort.
  - [x] Create a process to signal users of a proposed interface change and interface changelog. https://github.com/ipfs/interface-ipfs-core/issues/55
  - [x] swarm API - https://github.com/ipfs/interface-ipfs-core/pull/35
  - [x] block API - https://github.com/ipfs/interface-ipfs-core/pull/32
  - [x] generic API - https://github.com/ipfs/interface-ipfs-core/pull/33
  - [x] pinning API - https://github.com/ipfs/interface-ipfs-core/pull/34
  - [x] swarm API - https://github.com/ipfs/interface-ipfs-core/pull/35
  - [x] DHT API https://github.com/ipfs/interface-ipfs-core/pull/36
- [ ] Robust testing infrastructure
  - [x] Isolation of tests. This includes:
    - Avoid cases where there is one set up for a bunch of test files, instead make each test file be runnable by itself. This also includes removing the use of all globals (i.e js-ipfs-api).
  - [x] Interoperability tests between js-ipfs and go-ipfs
    - [x] Done at the libp2p level
    - [x] (Dec 23 2016) Now done at js-ipfs level too
  - [ ] Benchmarking tests - https://github.com/ipfs/js-ipfs/pull/488
    - [x] (Dec 23 2016) https://github.com/ipfs/js-ipfs-bitswap/tree/master/benchmarks
  - [ ] Stress tests, things like:
    - Spawn a reasonable amount of nodes
    - Add large files
    - Exchange large files
  - [ ] IPTB (InterPlanetary TestBed) Integration

#### Extra:

- [x] Migration to pull-streams - https://github.com/ipfs/js-ipfs/issues/403
- [x] Test js-ipfs using ipfs-api through http-api with interface-ipfs-core tests
  - [x] test-block
  - [x] test-object
  - [x] test-files
  - [x] test-config
  - [x] test-swarm

### Dependencies:

- js-ipfs needs the following from go-ipfs (preferrably in a release) (https://github.com/ipfs/go-ipfs/issues/2738):
  - [x] Do not assume that the Public Key is only transfered in secio
  - [x] Websockets support (really nice to have)
  - [x] use the defined protocol multicodecs https://github.com/ipfs/specs/blob/master/libp2p/7-properties.md#757-protocol-multicodecs
- [x] go-libp2p scripts for libp2p interop testing https://github.com/ipfs/js-libp2p-ipfs-nodejs/issues/15

### Notes:

- We will be defining the API in `interface-ipfs-core`, however some pieces like DHT, mfs and pinning will not be available in js-ipfs.

##### Expected date of completion: `late August`

--------------------------------------------------------------------------------------------------

# 2016 Q4

# ✔️ Milestone - The InterPlanetary JavaScript

> Summary: Settle in what will be the 'good parts' for us to use accross JS projects

### Leads:

- David
- Friedel
- Victor
- Richard

### Tasks:

- [x] Create an issue for each of the 'parts' that needs to be discussed
- [x] Parts:
  - Supported Runtimes https://github.com/ipfs/js-ipfs/issues/536
  - Bundling js-ipfs and js-ipfs-api https://github.com/ipfs/js-ipfs/issues/429
  - Node.js version to support
  - ~~Flow control library~~ -> Natural convergence happened - use Async
  - Exposed Interfaces https://github.com/ipfs/js-ipfs/issues/557
  - Improving init https://github.com/ipfs/js-ipfs/issues/556
  - Getters and Setters - https://github.com/ipfs/js-ipfs/issues/267

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `Week 1 - October 17 to create the issues, discussion will happen throughout the quarter`

# ✔️ Milestone - Awesome IPLD - Enable js-ipfs to handle both merkledag protobufs and ipld cbor objects

> Summary: Integration of IPLD (js-ipld and js-ipld-ipfs) into js-ipfs.

### Leads:

- David

### Tasks:

- [x] Awesome IPLD endeavour PR - https://github.com/ipld/js-ipld-resolver/pull/60

### Dependencies:

- [x] CID spec
- [x] go-ipfs with IPLD already integrated (it would be best)

### Requirements by other projects:

- everyone is waiting for this

### Notes: `NA`
##### Expected date of completion: `Week 2 - Oct 24`



# ✔️ Milestone - Async Crypto

> Summary: Move away from bundling in node-forge and use the WebCrypto browser primitives directly

### Leads:

- Friedel

### Tasks:

- [x] https://github.com/ipfs/js-ipfs/pull/485 (the PR of PRs)

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `Week 2 - Oct 24`

# Milestone - The DAG API

> Summary: Design, agree and implement the new DAG API

### Leads:

- David
- Juan

### Tasks:

- [ ] Figure out DAG API https://github.com/ipfs/interface-ipfs-core/issues/81
- [ ] Implement DAG API
- Bitswap Support
  - [x] Support for matching func - https://github.com/multiformats/js-multistream-select/pull/26
  - [x] Support bitswap 1.0.0 and 1.1.0 simultaneously https://github.com/ipfs/js-ipfs-bitswap/pull/76
  - [x] Fix bitswap compatibility with go-ipfs

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `Week 3 - Oct 31`



# Milestone - The Files API

> Summary: Achieve a 100% feature parity Unixfs Engine (with the several DAG Builders) and Files API

### Leads:

- David
- Pedro

### Tasks:

- Import and Export files just like go-ipfs
  - unixfs-engine support of:
    - [x] trickle-dag
    - [x] balanced-dag-
    - [ ] sharding (HAMT)
  - ensure compatibility with go
    - [x] import export files both implementations (tests)
    - [ ] exchange files (bitswap) betweeen both implementations (tests)
- Files API (mfs)
  - [ ] Complete the spec https://github.com/ipfs/interface-ipfs-core/pull/38

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: 

Not having full unixfs-engine feature matching was causing the 'bitswap only requesting one block', because the exporter of unixfs-engine was not crawling through the dag formed by go-ipfs.

Bonus: Start thinking about the Importer/Exporter spec.

This milestone was added as an extra during the quarter.

##### Expected date of completion: `NA`

# ✔️ Milestone - js-ipfs and js-ipfs-api bundling 

> Summary: Make it work with any bundler, out of the box or provide proper documentation if not possible.

### Leads:

- Friedel

### Tasks:

- [x] https://github.com/ipfs/js-ipfs/issues/429

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `Week 3 - Oct 31`



# Milestone - Documentation of all the modules

> Summary: 

### Leads:

- Friedel

### Tasks: 
- [x] Ship `aegir-docs`
- [x] Ship custom theme for documentation.js https://github.com/dignifiedquire/clean-documentation-theme
- [ ] Add documentation, overall tracking: https://github.com/ipfs/js-ipfs/issues/615
  - [ ] js-ipfs: https://github.com/ipfs/js-ipfs/pull/651
  - [ ] js-ipfs-api: https://github.com/ipfs/js-ipfs-api/pull/469


### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `Week 6 - Nov 21`



# ✔️ Milestone - Quick Start examples for js-ipfs and js-ipfs-api

> Summary: 

### Leads:

- Samuli
- David
- Friedel
- Victor

### Tasks:

- [x] https://github.com/ipfs/js-ipfs-api/pull/421
- [x] https://github.com/ipfs/js-ipfs-api/issues/428
- [x] https://github.com/ipfs/js-ipfs/pull/607

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `Week 7 - Nov 28`

# Milestone - PubSub through Floodsub

> Summary: Integrate Floodsubin js-ipfs, exposing the same PubSub interface offered by go-ipfs (with interoperability tested)

### Leads:

- Gavin
- Samuli

### Tasks:

- [x] PubSub API Spec and tests - https://github.com/ipfs/interface-ipfs-core/pull/101
- [x] Implementation in js-ipfs - https://github.com/ipfs/js-ipfs/pull/644
- [x] Implementation in js-ipfs-api - https://github.com/ipfs/js-ipfs-api/pull/493

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: 
- `This milestone was added as an extra during the quarter.`
- Shipping blocked by http streaming issues for `subscribe`: https://github.com/ipfs/js-ipfs-api/pull/493#issuecomment-268603853

##### Expected date of completion: `NA`


--------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------

# Cached milestones (to re-evaluate for next quarter)

### Tasks:

- [ ] Amazing examples
  - [ ] Create the same examples available on https://ipfs.io/docs/examples/ using js-ipfs (through CLI and programatically)
  - [x] Example: Create an IPFS node
  - [x] Examples: Add files to IPFS
  - [ ] Tutorial: Build an 'pastebin' with js-ipfs
  - [ ] Tutorial: How to use js-ipfs in the browser
  - [ ] Tutorial: Make a video player with js-ipfs https://github.com/ipfs/js-ipfs/issues/128
  - [ ] Tutorial: Load a Webpage/WebApplication using js-ipfs
  - [ ] Add all of the examples to https://ipfs.io/docs/examples/
- [ ] Revisit and complete the IPFS spec
- [ ] IPNS
- [ ] pinning API
- [x] ping

# Milestone - Shoot for the moon 🌑

> Summary: Grandiose ideas to make the js-ipfs project really awesome. It might take some time to get to them, but writting them down is always good.

### Tasks:

- [ ] InterPlanetary Lab - A test lab for the IPFS project, spawning nodes in different geographic locations with different network and machine conditions to really stress test IPFS (heavily inspired by [PlanetLab](https://www.planet-lab.org/))

### Dependencies: `NA`
### Requirements by other projects: `NA`
### Notes: `NA`
##### Expected date of completion: `TBA`

---------------------------------------------------------------------


# Project Status

### Per component view

| Name          | Spec | Disc |
|:--------------|:-----|:-----|
| Importers     | https://github.com/ipfs/specs/pull/57 | https://github.com/ipfs/js-ipfs/issues/41
| repo          | https://github.com/ipfs/specs/tree/master/repo | https://github.com/ipfs/js-ipfs/issues/51
| network layer | https://github.com/ipfs/specs/tree/master/libp2p | https://github.com/diasdavid/js-libp2p/issues
| bitswap       | https://github.com/ipfs/js-ipfs/issues/51 | https://github.com/ipfs/js-ipfs/issues/51
| pin           | | https://github.com/ipfs/js-ipfs/issues/59
| files         | | https://github.com/ipfs/js-ipfs/issues/60
| daemon        | | https://github.com/ipfs/js-ipfs/issues/57
| object        | | https://github.com/ipfs/js-ipfs/issues/58
| block         | | https://github.com/ipfs/js-ipfs/issues/50
| bootstrap     | | https://github.com/ipfs/js-ipfs/issues/46
| init          | | https://github.com/ipfs/js-ipfs/issues/42

### Per feature view

- **core**
  - [x] version
  - [x] daemon
  - [x] id
  - [x] block
    - [x] get
    - [x] put
    - [x] stat
  - [x] object - Basic manipulation of the DAG
    - [x] data
    - [x] get
    - [x] links
    - [x] new
    - [x] patch
    - [x] put
    - [x] stat
  - [ ] refs - Listing of references. (walking around the graph)
    - [ ] local
  - [ ] repo
    - [x] init
    - [ ] stat
    - [ ] gc
  - [ ] pin
    - [ ] add
    - [ ] ls
    - [ ] rm
- **extensions**
  - [ ] name (IPNS)
    - [ ] publish
    - [ ] resolve
  - [ ] dns
    - [ ] resolve
  - [ ] tar
    - [ ] add
    - [ ] cat
  - [x] files
    - [x] add
    - [x] cat
    - [x] get
  - [ ] stat - Statistics about everything
    - [ ] bw
  - [x] bootstrap
    - [x] add
    - [x] list
    - [x] rm
  - [x] bitswap
    - [x] stat
    - [ ] unwant
    - [x] wantlist
- **tooling**
  - [x] commands
  - [x] init - sugar on top of ipfs repo init
  - [x] config
    - [x] edit
    - [x] replace
    - [x] show
- **network** (bubbles up from libp2p)
  - [ ] ping
  - [ ] dht
    - [ ] findpeer
    - [ ] findprovs
    - [ ] get
    - [ ] put
    - [ ] query
  - [x] swarm
    - [x] addrs
    - [x] connect
    - [x] disconnect
    - [x] peers
