# ipfs-core-types <!-- omit in toc -->

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs/status.svg?style=flat-square&path=packages/ipfs-core-types)](https://david-dm.org/ipfs/js-ipfs?path=packages/ipfs-core-types)

> IPFS interface definitions used by implementations for API compatibility

## Table of Contents <!-- omit in toc -->

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
  - [In JSDoc syntax](#in-jsdoc-syntax)
  - [In Typescript](#in-typescript)
- [Validation](#validation)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Background

The primary goal of this module is to define and ensure that IPFS core implementations and their respective client libraries implement the same interface, so that developers can quickly change between a local and a remote node without having to change their applications.

It offers a set of typescript interface definitions that define the IPFS core API.  Once your implementation implements those APIs you can use the tests found in the [interface-ipfs-core](https://www.npmjs.com/package/interface-ipfs-core) module to validate your implementation.

## Install

In JavaScript land:

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


## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)

[![](https://github.com/ipfs/js-ipfs/raw/master/ipfs-core-types/img/badge.png)](https://github.com/ipfs/js-ipfs/tree/master/ipfs-core-types)
