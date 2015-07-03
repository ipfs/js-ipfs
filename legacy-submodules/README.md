# ipfs submodules

These are separate modules, published independently on npm.
Kept here while node-ipfs implementation is young. Will be
broken out to separate repos when the time is right.
For now, this is easier + keeps all interop versions locked.

needed for first version:
- [ ] ipfs-mount - mounts all ipfs under /ipfs
- [x] ipfs-cli - simple file manipulations: add, cat, ls
- [ ] ipfs-filesystem - filesystem interface
- [x] ipfs-path-resolver - resolve paths from ipfs storage
- [x] ipfs-path - paths for ipfs objects
- [x] ipfs-objects-git - git-like objects: commit, tree, list, block
- [x] ipfs-objects - objects out of protobufs. interface. (serialization, links)
- [x] ipfs-storage - store objects for a key
