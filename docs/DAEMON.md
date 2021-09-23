
# Running IPFS as a daemon <!-- omit in toc -->

> How to run a long-lived IPFS process

## Table of contents <!-- omit in toc -->

- [CLI](#cli)
- [Programmatic](#programmatic)

## CLI

To start a daemon on the CLI, use the `daemon` command:

```console
jsipfs daemon
```

The IPFS Daemon exposes the API defined in the [HTTP API spec](https://docs.ipfs.io/reference/api/http/). You can use any of the IPFS HTTP-API client libraries with it, such as: [ipfs-http-client](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client).

## Programmatic

If you want a programmatic way to spawn a IPFS Daemon using JavaScript, check out the [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl) module.

```javascript
import { createFactory } from 'ipfsd-ctl'
const factory = createFactory({
  type: 'proc' // or 'js' to run in a separate process
})

const node = await factory.create()

// print the node ide
console.info(await node.id())
```
