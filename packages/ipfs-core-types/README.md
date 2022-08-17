# ipfs-core-types <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/js-test-and-release.yml)

> IPFS interface definitions used by implementations for API compatibility.

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Background](#background)
- [Usage](#usage)
  - [In JSDoc syntax](#in-jsdoc-syntax)
  - [In Typescript](#in-typescript)
- [Validation](#validation)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-core-types
```

## Background

The primary goal of this module is to define and ensure that IPFS core implementations and their respective client libraries implement the same interface, so that developers can quickly change between a local and a remote node without having to change their applications.

It offers a set of typescript interface definitions that define the IPFS core API.  Once your implementation implements those APIs you can use the tests found in the [interface-ipfs-core](https://www.npmjs.com/package/interface-ipfs-core) module to validate your implementation.

```console
$ npm install ipfs-core-types
```

## Usage

Install `ipfs-core-types` as one of the dependencies of your project and use it to ensure your implementations API compatibility:

### In [JSDoc syntax](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)

```js
/**
 * @implements {import('ipfs-core-types').IPFS}
 */
class MyImpl {
  // your implementation goes here
}
```

### In Typescript

```ts
import type { IPFS } from 'ipfs-core-types'
class MyImpl implements IPFS {
  // your implementation goes here
}
```

## Validation

In order to validate API compatibility you can run [typescript](https://www.typescriptlang.org/) over your implementation which will point out all the API compatibilities if there are some.

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
