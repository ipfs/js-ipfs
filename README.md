# THIS REPO IS DEPRECATED

### Check the new node-ipfs roadmap and respective code at: https://github.com/ipfs/node-ipfs


===================================




> This is a work in progress. it's not ready yet. we'll be pushing efforts into this implementation shortly. stay tuned + come hang out on irc.

`#ipfs` on freenode.

----

See: https://github.com/jbenet/ipfs

Please put all issues regarding IPFS _design_ in the
[ipfs repo issues](https://github.com/jbenet/ipfs/issues).

Please put all issues regarding node IPFS _implementation_ in [this repo](https://github.com/jbenet/node-ipfs/issues).

## Install

WARNING: this does nothing useful yet!

```
git clone https://github.com/jbenet/node-ipfs
cd node-ipfs
make
ipfs
```

The Makefile basically does:

```
# npm install all deps
cd submodules && ./npm-install.sh && cd ..

# link cli
cd submodules/ipfs-cli && npm link
```

## Example

Suppose we have some files

```
> tree foo
foo
├── bam
│   └── bam
├── bar
└── baz

1 directory, 3 files

> cat foo/bar foo/baz foo/bam/bam
bar
baz
bam
```

Let's add them to ipfs

```
> ipfs add foo
foo: ignored (use -r for recursive)

> ipfs add -r foo
foo/baz: added block /XLM1ZETht3wv8vUPXMkx3JZGP5T9txAz782
foo/bar: added block /XLMCA8WXBNRBwFhzRnHgHFLwGmQzkAQELH7
foo/bam/bam: added block /XLaGqmCUX7sk52P4pkth8S5wV4NMztnf9zd
foo/bam: added tree /XLMLiUaCc7jh3eGFsNR8AhvRSSFySSvTaNb
foo: added tree /XLaoVHd834v62UsW56jew8Mp6FgZBXnZEeL
```

This added each file + directiory as `block` and `tree` objects, including the hash addresses.


We can list the directories (foo/ and foo/bam)

```
> ipfs ls /XLaoVHd834v62UsW56jew8Mp6FgZBXnZEeL
XLMLiUaCc7jh3eGFsNR8AhvRSSFySSvTaNb 47 bam
XLMCA8WXBNRBwFhzRnHgHFLwGmQzkAQELH7 6 bar
XLM1ZETht3wv8vUPXMkx3JZGP5T9txAz782 6 baz

> ipfs ls XLMLiUaCc7jh3eGFsNR8AhvRSSFySSvTaNb
XLaGqmCUX7sk52P4pkth8S5wV4NMztnf9zd 6 bam
```

We can `cat` the files.

```
> ipfs cat XLaGqmCUX7sk52P4pkth8S5wV4NMztnf9zd
bam

> ipfs cat XLMCA8WXBNRBwFhzRnHgHFLwGmQzkAQELH7
bar
```

And we can resolve paths through the `trees` :)

```
> ipfs cat /XLaoVHd834v62UsW56jew8Mp6FgZBXnZEeL/bar
bar

> ipfs cat /XLaoVHd834v62UsW56jew8Mp6FgZBXnZEeL/bam/bam
bam
```

```
> ipfs refs -r /XLaoVHd834v62UsW56jew8Mp6FgZBXnZEeL
XLMLiUaCc7jh3eGFsNR8AhvRSSFySSvTaNb
XLMCA8WXBNRBwFhzRnHgHFLwGmQzkAQELH7
XLM1ZETht3wv8vUPXMkx3JZGP5T9txAz782
XLaGqmCUX7sk52P4pkth8S5wV4NMztnf9zd
```


## [submodules](submodules/)

In progress:

- ipfs - (this repo) master library, puts it all together
- ipfs-bitswap - the Block Exchange protocol interface
- ipfs-block - ipfs unit of data
- ipfs-blocks - block service, using ipfs-storage
- ipfs-cli - cli to a local ipfs node
- ipfs-core - small hub, wires the core together
- ipfs-dht - dht implementation (coral + s/kademlia)
- ipfs-dht-routing - routing system using dht
- ipfs-errors - errors (deprecated)
- ipfs-message-stream - stream of packets (replaced by msgproto)
- ipfs-mount - mount ipfs node using FUSE
- ipfs-object - base ipfs object structure
- ipfs-objects-git - git-like objects for filesystem + version control
- ipfs-packet - packet coding (replaced by msgproto)
- ipfs-path - ipfs path structure
- ipfs-path-resolver - resolves paths using ipfs-blocks
- ipfs-peer - a peer identity, including id and network addresses
- ipfs-peer-ledger - relationship ledger between local and another peer
- ipfs-peer-book - keeps track of multiple peer relationships
- ipfs-routing - routing system interface
- ipfs-storage - local node storage (kv store)

Todo:

- ipfs-netmux - manages connections to multiple networks
- ipfs-bitswap - the Block Exchange protocol interface
- ipfs-bitswap-standard - the standard bitswap implementation
- ipfs-datastore - datastore interface for ipfs
- ipfs-cadag - the ipfs cadag primitives
- ipfs-versioning - implementation of git analogue tools
- ipfs-filesystem - a file system interface
- ipfs-crypto - all crypto functions used by ipfs.
