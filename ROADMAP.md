IPFS JavaScript Implementation roadmap
======================================

# Milestone 1 - js-ipfs on the browser

> Summary: This milestone's focus is to ship a version of js-ipfs that can be embed in browser applications, creating an IPFS node inside a browser web application.

### Tasks:

- [ ] files API
  - [x] js-ipfs-unixfs
  - [x] fixed size chunker
  - [x] unixfs layout
  - [x] jsipfs files add
  - [ ] jsipfs files get
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
  - [ ] [secio](https://github.com/ipfs/js-libp2p-secio)

# Milestone 2 - TBD

> Summary: TO BE DISCUSSED

# Project Status

### Per component view

| Name | Spec | Disc |
| :----| :----| :----|
| data importing | https://github.com/ipfs/specs/pull/57 | https://github.com/ipfs/js-ipfs/issues/41
| repo | https://github.com/ipfs/specs/tree/master/repo | https://github.com/ipfs/js-ipfs/issues/51
| network layer | https://github.com/ipfs/specs/tree/master/libp2p | https://github.com/diasdavid/js-libp2p/issues
| bitswap | https://github.com/ipfs/js-ipfs/issues/51 | https://github.com/ipfs/js-ipfs/issues/51
| pin | | https://github.com/ipfs/js-ipfs/issues/59
| files | | https://github.com/ipfs/js-ipfs/issues/60
| daemon | | https://github.com/ipfs/js-ipfs/issues/57
| object | | https://github.com/ipfs/js-ipfs/issues/58
| block | |  https://github.com/ipfs/js-ipfs/issues/50
| bootstrap | | https://github.com/ipfs/js-ipfs/issues/46
| init | | https://github.com/ipfs/js-ipfs/issues/42

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
    - [ ] cat
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
