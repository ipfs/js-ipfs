# IPFS CLI <!-- omit in toc -->

## Table of contents <!-- omit in toc -->

- [Overview](#overview)
- [Configuration](#configuration)

## Overview

In order to use js-ipfs as a CLI, you must install it with the `global` flag. Run the following (even if you have ipfs installed locally):

```bash
npm install ipfs --global
```

The CLI is available by using the command `jsipfs` in your terminal. This is aliased, instead of using `ipfs`, to make sure it does not conflict with the [Go implementation](https://github.com/ipfs/go-ipfs).

Once installed, please follow the [Getting Started Guide](https://docs.ipfs.io/introduction/usage/) to learn how to initialize your node and run the daemon.

```sh
# Install js-ipfs globally
> jsipfs --help
Commands:
  bitswap               A set of commands to manipulate the bitswap agent.
  block                 Manipulate raw IPFS blocks.
  bootstrap             Show or edit the list of bootstrap peers.
  commands              List all available commands
  config <key> [value]  Get and set IPFS config values
  daemon                Start a long-running daemon process
# ...
```

## Configuration

`js-ipfs` uses some different default config values, so that they don't clash directly with a go-ipfs node running in the same machine. These are:

- default repo location: `~/.jsipfs` (can be changed with env variable `IPFS_PATH`)
- default swarm port: `4002`
- default API port: `5002`
