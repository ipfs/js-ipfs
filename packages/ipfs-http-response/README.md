# ipfs-http-response <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/js-test-and-release.yml)

> Creates an HTTP response from an IPFS Hash

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Creating HTTP Response](#creating-http-response)
  - [Using protocol-agnostic resolver](#using-protocol-agnostic-resolver)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-http-response
```

## Usage

### Creating HTTP Response

This project creates a HTTP response for an IPFS Path. This response can be a file, a HTML with directory listing or the entry point of a web page.

```js
import { getResponse } from 'ipfs-http-response'

const result = await getResponse(ipfsNode, ipfsPath)
console.log(result)
```

### Using protocol-agnostic resolver

This module also exports the used ipfs `resolver`, which should be used when the response needs to be customized or non-HTTP transport is used:

```js
import { resolver } from 'ipfs-http-response'

const result = await resolver.cid(ipfsNode, ipfsPath)
console.log(result)
```

If `ipfsPath` points at a directory, `resolver.cid` will throw Error `This dag node is a directory` with a `cid` attribute that can be passed to `resolver.directory`:

```js
import { resolver } from 'ipfs-http-response'

const result = await resolver.directory(ipfsNode, ipfsPath, cid)
console.log(result)
```

`result` will be either a `string` with HTML directory listing or an array with CIDs of `index` pages present in inspected directory.

![ipfs-http-response usage](docs/ipfs-http-response.png "ipfs-http-response usage")

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipfs/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
