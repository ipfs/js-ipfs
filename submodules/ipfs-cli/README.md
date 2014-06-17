# ipfs-cli - IPFS Command Line Interface

This is the command line interface to [node-ipfs](https://github.com/jbenet/node-ipfs). It uses a config specified by the `--config` flag, or defaults to `~/.ipfsconfig`.

## Install

```
git clone https://github.com/jbenet/node-ipfs
cd node-ipfs/submodules/ipfs-cli
npm link
```

(Yes, this will be in npm very soon.)

## Usage

```sh
# output the contents of a path
ipfs cat <ipfs-path>

# add the file tree at <path>. outputs root hash.
ipfs add [-r] <path>
```

