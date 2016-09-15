IPFS JavaScript Implementation roadmap
======================================

> We track the development of the js-ipfs project through Github issues and [Waffle.io](https://waffle.io/ipfs/js-ipfs). See our waffle board at: [https://waffle.io/ipfs/js-ipfs](https://waffle.io/ipfs/js-ipfs)

# Milestone 1 - js-ipfs on the browser

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

# Milestone 2 - Quality and correctness of the JavaScript Implementation

> Summary: The focus of this milestone is quality of the JavaScript implementation so that users of the library can build their applications with confidence.

### Tasks:

- [ ] Interface definition, documentation and test coverage for both js-ipfs and js-ipfs-api. The `interface-ipfs-core` effort.
  - [x] Create a process to signal users of a proposed interface change and interface changelog. https://github.com/ipfs/interface-ipfs-core/issues/55
  - [x] swarm API - https://github.com/ipfs/interface-ipfs-core/pull/35
  - [x] block API - https://github.com/ipfs/interface-ipfs-core/pull/32
  - [x] generic API - https://github.com/ipfs/interface-ipfs-core/pull/33
  - [x] pinning API - https://github.com/ipfs/interface-ipfs-core/pull/34
  - [x] swarm API - https://github.com/ipfs/interface-ipfs-core/pull/35
  - [ ] DHT API https://github.com/ipfs/interface-ipfs-core/pull/36
  - [ ] mfs API https://github.com/ipfs/interface-ipfs-core/pull/38
- [ ] Robust testing infrastructure
  - [x] Isolation of tests. This includes:
    - Avoid cases where there is one set up for a bunch of test files, instead make each test file be runnable by itself. This also includes removing the use of all globals (i.e js-ipfs-api).
  - [ ] Interoperability tests between js-ipfs and go-ipfs
  - [ ] Benchmarking tests
  - [ ] Stress tests, things like:
    - Spawn a reasonable amount of nodes
    - Add large files
    - Exchange large files
  - [ ] IPTB (InterPlanetary TestBed) Integration
- [ ] Fixed identified bugs to date

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
- [x] go-libp2p scripts for libp2p interop testing https://github.com/ipfs/js-libp2p-ipfs/issues/15

### Notes:

- We will be defining the API in `interface-ipfs-core`, however some pieces like DHT, mfs and pinning will not be available in js-ipfs.

##### Expected date of completion: `late August`

# Milestone 3 - Enter IPLD - Enable js-ipfs to handle both merkledag protobufs and ipld cbor objects

> Summary: Integration of IPLD (js-ipld and js-ipld-ipfs) into js-ipfs.

### Tasks:

NA

### Dependencies:

- [ ] IPLD migration path
- [ ] go-ipfs with IPLD already integrated (it would be best)

### Requirements by other projects:

NA

### Notes:

NA

##### Expected date of completion: `mid September`

# Milestone 4 - Documentation and Developer Experience

> Summary: During this period, we will focus on bringing great developer experience to js-ipfs, this includes: great examples, documentation, tutorials, blog posts and more, enabling more developers to hack with js-ipfs or contribute to the project.

### Tasks:

- [ ] Amazing examples
  - [ ] Create the same examples available on https://ipfs.io/docs/examples/ using js-ipfs (through CLI and programatically)
  - [ ] Example: Create an IPFS node
  - [ ] Examples: Add files to IPFS
  - [ ] Tutorial: Build an 'pastebin' with js-ipfs
  - [ ] Tutorial: How to use js-ipfs in the browser
  - [ ] Tutorial: Make a video player with js-ipfs https://github.com/ipfs/js-ipfs/issues/128
  - [ ] Tutorial: Load a Webpage/WebApplication using js-ipfs
  - [ ] Add all of the examples to https://ipfs.io/docs/examples/
- [ ] Revisit and complete the IPFS spec

### Dependencies:

NA

### Requirements by other projects:

NA

### Notes:

NA

##### Expected date of completion: `TBA`

# Milestone 5 - 1st implementation Peer Routing + Content Routing (the go-ipfs DHT)

> Summary: Enable content discovery in js-ipfs

### Tasks:

- [ ] js-ipfs-dht

### Dependencies:

NA

### Requirements by other projects:

NA

### Notes:

NA

##### Expected date of completion: `TBA`

# Milestone 6 - The last miles for complete feature parity with go-ipfs

> Summary: 100% feature parity and interop with go-ipfs

### Tasks:

- [ ] mfs
- [ ] ipns
- [ ] HAMT on unixfs-engine
- [ ] ls
- [ ] pinning
- [ ] ping

### Dependencies:

NA

### Requirements by other projects:

NA

### Notes:

##### Expected date of completion: `TBA`


# Milestone 7 - Shoot for the moon 🌑

> Summary: Grandiose ideas to make the js-ipfs project really awesome. It might take some time to get to them, but writting them down is always good.

### Tasks:

- [ ] InterPlanetary Lab - A test lab for the IPFS project, spawning nodes in different geographic locations with different network and machine conditions to really stress test IPFS (heavily inspired by [PlanetLab](https://www.planet-lab.org/))

### Dependencies:

NA

### Requirements by other projects:

NA

### Notes:

NA

##### Expected date of completion: `TBA`

---------------------------------------------------------------------


# Project Status

### Per component view

| Name          | Spec | Disc |
| :-------------| :----| :----|
| Importers     | https://github.com/ipfs/specs/pull/57 | https://github.com/ipfs/js-ipfs/issues/41
| repo          | https://github.com/ipfs/specs/tree/master/repo | https://github.com/ipfs/js-ipfs/issues/51
| network layer | https://github.com/ipfs/specs/tree/master/libp2p | https://github.com/diasdavid/js-libp2p/issues
| bitswap       | https://github.com/ipfs/js-ipfs/issues/51 | https://github.com/ipfs/js-ipfs/issues/51
| pin           | | https://github.com/ipfs/js-ipfs/issues/59
| files         | | https://github.com/ipfs/js-ipfs/issues/60
| daemon        | | https://github.com/ipfs/js-ipfs/issues/57
| object        | | https://github.com/ipfs/js-ipfs/issues/58
| block         | |  https://github.com/ipfs/js-ipfs/issues/50
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
  - [ ] refs - Listing of references. (alking around the graph)
    - [ ] local
  - [ ] repo
    - [x] init
    - [ ] stat
    - [ ] gc
  - [ ] pin
    - [ ] add
    - [ ] ls
    - [ ] rm
  - [ ] log
    - [ ] level
    - [ ] tail
- **extensions**
  - [ ] name (IPNS)
    - [ ] publish
    - [ ] resolve
  - [ ] dns
    - [ ] resolve
  - [ ] tar
    - [ ] add
    - [ ] cat
  - [ ] tour
    - [ ] list
    - [ ] next
    - [ ] restart
  - [ ] files
    - [x] add
    - [x] cat
    - [ ] get
  - [ ] stat - Statistics about everything
    - [ ] bw
  - [ ] mount
  - [x] bootstrap
    - [x] add
    - [x] list
    - [x] rm
  - [x] bitswap
    - [ ] stat
    - [ ] unwant
    - [ ] wantlist
- **tooling**
  - [x] commands
  - [ ] update
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
  - [ ] swarm
    - [x] addrs
    - [x] connect
    - [x] disconnect
    - [ ] filters
    - [x] peers
  - [ ] records (IPRS)
    - [ ] put
    - [ ] get
